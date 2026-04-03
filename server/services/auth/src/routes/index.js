const express = require("express");
const { createAuthRoutes } = require("./authRoutes");

function createRoutes(authController) {
  const router = express.Router();

  router.use("/api/v1/auth", createAuthRoutes(authController));

  return router;
}

module.exports = { createRoutes };
