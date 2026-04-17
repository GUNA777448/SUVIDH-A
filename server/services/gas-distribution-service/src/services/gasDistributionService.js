const { AppError } = require("../lib/appError");
const {
  createCustomer,
  createConnection,
  listDistributors,
  findCustomerById,
  findConnectionById,
  findDuplicateCustomer,
  createBooking,
  findBookingById,
  updateBookingStatus,
  listBookings,
  createComplaint,
  findComplaintById,
  updateComplaintStatus,
  addEvent,
  getDashboardMetrics,
} = require("../repositories/gasRepository");
const {
  validateCustomerPayload,
  validateBookingPayload,
  validateBookingStatusPayload,
  validateComplaintPayload,
  validateComplaintStatusPayload,
} = require("../validators/gasValidators");

const BOOKING_TRANSITIONS = {
  placed: new Set(["confirmed", "cancelled"]),
  confirmed: new Set(["out_for_delivery", "cancelled"]),
  out_for_delivery: new Set(["delivered", "cancelled"]),
  delivered: new Set(),
  cancelled: new Set(),
};

const COMPLAINT_TRANSITIONS = {
  open: new Set(["in_progress", "escalated", "closed"]),
  in_progress: new Set(["resolved", "escalated", "closed"]),
  resolved: new Set(["closed", "escalated"]),
  escalated: new Set(["in_progress", "resolved", "closed"]),
  closed: new Set(),
};

function getOverview() {
  return {
    service: "gas-distribution-service",
    scope: "gas-distribution",
    message: "Gas distribution service overview",
    capabilities: [
      "customer onboarding",
      "connection lifecycle",
      "refill booking",
      "complaint tracking",
      "dashboard metrics",
    ],
  };
}

async function getDistributors(filters) {
  const normalized = {
    state: filters.state ? String(filters.state).trim() : undefined,
    pincode: filters.pincode ? String(filters.pincode).trim() : undefined,
    is_active:
      filters.is_active === undefined
        ? true
        : String(filters.is_active).toLowerCase() === "true",
  };

  return listDistributors(normalized);
}

function buildSlaDueAt(severity) {
  const now = Date.now();
  const minutesBySeverity = {
    low: 24 * 60,
    medium: 12 * 60,
    high: 4 * 60,
    emergency: 30,
  };

  const ttlMinutes = minutesBySeverity[severity] || 24 * 60;
  return new Date(now + ttlMinutes * 60 * 1000).toISOString();
}

async function onboardCustomer(payload) {
  const errors = validateCustomerPayload(payload);
  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid customer payload", {
      errors,
    });
  }

  const duplicate = await findDuplicateCustomer(
    payload.mobile_number,
    payload.address_line,
  );
  if (duplicate) {
    throw new AppError(409, "CUSTOMER_EXISTS", "Customer already exists", {
      customer_id: duplicate.id,
      customer_number: duplicate.customer_number,
    });
  }

  const customer = await createCustomer(payload);
  const connection = await createConnection({
    customer_id: customer.id,
    connection_type: payload.connection_type,
    distributor_code: payload.distributor_code,
  });

  await addEvent({
    entity_type: "connection",
    entity_id: connection.id,
    event_type: "connection_created",
    auth_user_id: payload.auth_user_id,
    payload_json: {
      customer_id: customer.id,
      connection_type: connection.connection_type,
    },
  });

  return {
    customer,
    connection,
  };
}

async function getCustomerById(customerId) {
  const customer = await findCustomerById(customerId);
  if (!customer) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found", {
      customer_id: customerId,
    });
  }

  return customer;
}

async function placeBooking(payload) {
  const errors = validateBookingPayload(payload);
  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid booking payload", {
      errors,
    });
  }

  const customer = await findCustomerById(payload.customer_id);
  if (!customer) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found", {
      customer_id: payload.customer_id,
    });
  }

  const connection = await findConnectionById(payload.connection_id);
  if (!connection || connection.customer_id !== customer.id) {
    throw new AppError(404, "CONNECTION_NOT_FOUND", "Connection not found", {
      connection_id: payload.connection_id,
    });
  }

  const booking = await createBooking(payload);
  await addEvent({
    entity_type: "booking",
    entity_id: booking.id,
    event_type: "booking_placed",
    auth_user_id: customer.auth_user_id,
    payload_json: {
      booking_number: booking.booking_number,
      customer_id: booking.customer_id,
    },
  });

  return booking;
}

async function getBookingById(bookingId) {
  const booking = await findBookingById(bookingId);
  if (!booking) {
    throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found", {
      booking_id: bookingId,
    });
  }

  return booking;
}

async function getBookings(filters) {
  return listBookings(filters);
}

async function changeBookingStatus(bookingId, payload) {
  const errors = validateBookingStatusPayload(payload);
  if (errors.length > 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Invalid booking status payload",
      {
        errors,
      },
    );
  }

  const booking = await findBookingById(bookingId);
  if (!booking) {
    throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found", {
      booking_id: bookingId,
    });
  }

  if (
    !BOOKING_TRANSITIONS[booking.booking_status].has(payload.booking_status)
  ) {
    throw new AppError(
      409,
      "INVALID_BOOKING_TRANSITION",
      "Booking status transition is not allowed",
      {
        current_status: booking.booking_status,
        target_status: payload.booking_status,
      },
    );
  }

  const updated = await updateBookingStatus(bookingId, payload.booking_status);
  await addEvent({
    entity_type: "booking",
    entity_id: updated.id,
    event_type: `booking_${payload.booking_status}`,
    auth_user_id: booking.auth_user_id,
    payload_json: {
      booking_number: updated.booking_number,
    },
  });

  return updated;
}

async function registerComplaint(payload) {
  const errors = validateComplaintPayload(payload);
  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid complaint payload", {
      errors,
    });
  }

  const customer = await findCustomerById(payload.customer_id);
  if (!customer) {
    throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer not found", {
      customer_id: payload.customer_id,
    });
  }

  if (payload.booking_id) {
    const booking = await findBookingById(payload.booking_id);
    if (!booking || booking.customer_id !== customer.id) {
      throw new AppError(404, "BOOKING_NOT_FOUND", "Booking not found", {
        booking_id: payload.booking_id,
      });
    }
  }

  const complaint = await createComplaint({
    ...payload,
    sla_due_at: buildSlaDueAt(payload.severity),
  });

  await addEvent({
    entity_type: "complaint",
    entity_id: complaint.id,
    event_type:
      payload.severity === "emergency"
        ? "complaint_emergency"
        : "complaint_created",
    auth_user_id: customer.auth_user_id,
    payload_json: {
      complaint_number: complaint.complaint_number,
      severity: complaint.severity,
    },
  });

  return complaint;
}

async function getComplaintById(complaintId) {
  const complaint = await findComplaintById(complaintId);
  if (!complaint) {
    throw new AppError(404, "COMPLAINT_NOT_FOUND", "Complaint not found", {
      complaint_id: complaintId,
    });
  }

  return complaint;
}

async function changeComplaintStatus(complaintId, payload) {
  const errors = validateComplaintStatusPayload(payload);
  if (errors.length > 0) {
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Invalid complaint status payload",
      {
        errors,
      },
    );
  }

  const complaint = await findComplaintById(complaintId);
  if (!complaint) {
    throw new AppError(404, "COMPLAINT_NOT_FOUND", "Complaint not found", {
      complaint_id: complaintId,
    });
  }

  if (!COMPLAINT_TRANSITIONS[complaint.status].has(payload.status)) {
    throw new AppError(
      409,
      "INVALID_COMPLAINT_TRANSITION",
      "Complaint status transition is not allowed",
      {
        current_status: complaint.status,
        target_status: payload.status,
      },
    );
  }

  const updated = await updateComplaintStatus(complaintId, payload.status);
  await addEvent({
    entity_type: "complaint",
    entity_id: updated.id,
    event_type: `complaint_${payload.status}`,
    payload_json: {
      complaint_number: updated.complaint_number,
    },
  });

  return updated;
}

async function getMetrics() {
  return getDashboardMetrics();
}

module.exports = {
  getOverview,
  getDistributors,
  onboardCustomer,
  getCustomerById,
  placeBooking,
  getBookingById,
  getBookings,
  changeBookingStatus,
  registerComplaint,
  getComplaintById,
  changeComplaintStatus,
  getMetrics,
};
