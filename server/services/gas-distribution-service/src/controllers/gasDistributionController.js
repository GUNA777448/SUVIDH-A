const {
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
} = require("../services/gasDistributionService");
const { AppError } = require("../lib/appError");

function sendSuccess(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || null,
      },
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    },
  });
}

function overview(_req, res) {
  return sendSuccess(res, "Gas service overview", getOverview());
}

async function listDistributors(req, res) {
  try {
    const distributors = await getDistributors({
      state: req.query.state,
      pincode: req.query.pincode,
      is_active: req.query.is_active,
    });
    return sendSuccess(res, "Distributors retrieved", distributors);
  } catch (error) {
    return sendError(res, error);
  }
}

async function createCustomer(req, res) {
  try {
    const created = await onboardCustomer(req.body || {});
    return sendSuccess(res, "Customer created", created, 201);
  } catch (error) {
    return sendError(res, error);
  }
}

async function getCustomer(req, res) {
  try {
    const customer = await getCustomerById(req.params.customerId);
    return sendSuccess(res, "Customer retrieved", customer);
  } catch (error) {
    return sendError(res, error);
  }
}

async function createBooking(req, res) {
  try {
    const booking = await placeBooking(req.body || {});
    return sendSuccess(res, "Booking created", booking, 201);
  } catch (error) {
    return sendError(res, error);
  }
}

async function getBooking(req, res) {
  try {
    const booking = await getBookingById(req.params.bookingId);
    return sendSuccess(res, "Booking retrieved", booking);
  } catch (error) {
    return sendError(res, error);
  }
}

async function listBooking(req, res) {
  try {
    const bookings = await getBookings({
      customer_id: req.query.customer_id,
      booking_status: req.query.booking_status,
      payment_status: req.query.payment_status,
    });
    return sendSuccess(res, "Bookings retrieved", bookings);
  } catch (error) {
    return sendError(res, error);
  }
}

async function patchBookingStatus(req, res) {
  try {
    const booking = await changeBookingStatus(
      req.params.bookingId,
      req.body || {},
    );
    return sendSuccess(res, "Booking status updated", booking);
  } catch (error) {
    return sendError(res, error);
  }
}

async function createComplaint(req, res) {
  try {
    const complaint = await registerComplaint(req.body || {});
    return sendSuccess(res, "Complaint created", complaint, 201);
  } catch (error) {
    return sendError(res, error);
  }
}

async function getComplaint(req, res) {
  try {
    const complaint = await getComplaintById(req.params.complaintId);
    return sendSuccess(res, "Complaint retrieved", complaint);
  } catch (error) {
    return sendError(res, error);
  }
}

async function patchComplaintStatus(req, res) {
  try {
    const complaint = await changeComplaintStatus(
      req.params.complaintId,
      req.body || {},
    );
    return sendSuccess(res, "Complaint status updated", complaint);
  } catch (error) {
    return sendError(res, error);
  }
}

async function dashboardMetrics(_req, res) {
  try {
    const metrics = await getMetrics();
    return sendSuccess(res, "Dashboard metrics retrieved", metrics);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  overview,
  listDistributors,
  createCustomer,
  getCustomer,
  createBooking,
  getBooking,
  listBooking,
  patchBookingStatus,
  createComplaint,
  getComplaint,
  patchComplaintStatus,
  dashboardMetrics,
};
