const express = require("express");

const electricityRouter = express.Router();

electricityRouter.get("/overview", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "electricity-service",
    scope: "electricity",
    message: "Electricity service overview",
    capabilities: [
      "billing",
      "meter connections",
      "outage updates",
      "service requests",
    ],
  });
});

module.exports = { electricityRouter };
