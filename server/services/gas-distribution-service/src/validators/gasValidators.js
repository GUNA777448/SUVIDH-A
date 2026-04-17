const ALLOWED_CONNECTION_TYPES = new Set(["domestic", "commercial"]);
const ALLOWED_CYLINDER_TYPES = new Set(["14_2kg", "5kg", "19kg"]);
const ALLOWED_PAYMENT_MODES = new Set([
  "upi",
  "card",
  "cash_on_delivery",
  "wallet",
]);
const ALLOWED_BOOKING_STATUSES = new Set([
  "placed",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
const ALLOWED_COMPLAINT_TYPES = new Set([
  "leakage",
  "delayed_delivery",
  "overcharge",
  "subsidy_issue",
  "behavior_issue",
  "other",
]);
const ALLOWED_SEVERITY = new Set(["low", "medium", "high", "emergency"]);
const ALLOWED_COMPLAINT_STATUSES = new Set([
  "open",
  "in_progress",
  "resolved",
  "escalated",
  "closed",
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function validateCustomerPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.auth_user_id)) {
    errors.push("auth_user_id is required");
  }
  if (!isNonEmptyString(payload.full_name)) {
    errors.push("full_name is required");
  }
  if (!/^\d{10}$/.test(String(payload.mobile_number || ""))) {
    errors.push("mobile_number must be a 10-digit number");
  }
  if (!isNonEmptyString(payload.address_line)) {
    errors.push("address_line is required");
  }
  if (!/^\d{6}$/.test(String(payload.pincode || ""))) {
    errors.push("pincode must be a 6-digit number");
  }
  if (!isNonEmptyString(payload.state)) {
    errors.push("state is required");
  }
  if (
    payload.connection_type !== undefined &&
    !ALLOWED_CONNECTION_TYPES.has(payload.connection_type)
  ) {
    errors.push("connection_type must be domestic or commercial");
  }
  if (
    payload.subsidy_opt_in !== undefined &&
    typeof payload.subsidy_opt_in !== "boolean"
  ) {
    errors.push("subsidy_opt_in must be a boolean");
  }

  return errors;
}

function validateBookingPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.customer_id)) {
    errors.push("customer_id is required");
  }
  if (!isNonEmptyString(payload.connection_id)) {
    errors.push("connection_id is required");
  }
  if (!ALLOWED_CYLINDER_TYPES.has(payload.cylinder_type)) {
    errors.push("cylinder_type is invalid");
  }
  if (!ALLOWED_PAYMENT_MODES.has(payload.payment_mode)) {
    errors.push("payment_mode is invalid");
  }

  return errors;
}

function validateBookingStatusPayload(payload) {
  const errors = [];

  if (!ALLOWED_BOOKING_STATUSES.has(payload.booking_status)) {
    errors.push("booking_status is invalid");
  }

  return errors;
}

function validateComplaintPayload(payload) {
  const errors = [];

  if (!isNonEmptyString(payload.customer_id)) {
    errors.push("customer_id is required");
  }
  if (
    payload.booking_id !== undefined &&
    !isNonEmptyString(payload.booking_id)
  ) {
    errors.push("booking_id must be a non-empty string when provided");
  }
  if (!ALLOWED_COMPLAINT_TYPES.has(payload.complaint_type)) {
    errors.push("complaint_type is invalid");
  }
  if (!ALLOWED_SEVERITY.has(payload.severity)) {
    errors.push("severity is invalid");
  }
  if (!isNonEmptyString(payload.description)) {
    errors.push("description is required");
  }

  return errors;
}

function validateComplaintStatusPayload(payload) {
  const errors = [];

  if (!ALLOWED_COMPLAINT_STATUSES.has(payload.status)) {
    errors.push("status is invalid");
  }

  return errors;
}

module.exports = {
  validateCustomerPayload,
  validateBookingPayload,
  validateBookingStatusPayload,
  validateComplaintPayload,
  validateComplaintStatusPayload,
};
