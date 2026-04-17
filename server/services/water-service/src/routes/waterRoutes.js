const express = require("express");

const waterRouter = express.Router();

waterRouter.get("/overview", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "water-service",
    scope: "water",
    message: "Water service overview",
    capabilities: [
      "billing",
      "consumption visibility",
      "connection support",
      "complaint handling",
    ],
  });
});

module.exports = { waterRouter };
