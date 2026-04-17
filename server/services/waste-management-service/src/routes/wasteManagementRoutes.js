const express = require("express");

const wasteManagementRouter = express.Router();

wasteManagementRouter.get("/overview", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "waste-management-service",
    scope: "waste-management",
    message: "Waste management service overview",
    capabilities: [
      "pickup scheduling",
      "sanitation requests",
      "complaint handling",
      "route status updates",
    ],
  });
});

module.exports = { wasteManagementRouter };
