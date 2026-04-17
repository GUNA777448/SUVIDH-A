const express = require("express");
const {
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
} = require("../controllers/gasDistributionController");

const gasDistributionRouter = express.Router();

gasDistributionRouter.get("/overview", overview);
gasDistributionRouter.get("/distributors", listDistributors);
gasDistributionRouter.post("/customers", createCustomer);
gasDistributionRouter.get("/customers/:customerId", getCustomer);
gasDistributionRouter.post("/bookings", createBooking);
gasDistributionRouter.get("/bookings/:bookingId", getBooking);
gasDistributionRouter.get("/bookings", listBooking);
gasDistributionRouter.patch("/bookings/:bookingId/status", patchBookingStatus);
gasDistributionRouter.post("/complaints", createComplaint);
gasDistributionRouter.get("/complaints/:complaintId", getComplaint);
gasDistributionRouter.patch(
  "/complaints/:complaintId/status",
  patchComplaintStatus,
);
gasDistributionRouter.get("/dashboard/metrics", dashboardMetrics);

module.exports = { gasDistributionRouter };
