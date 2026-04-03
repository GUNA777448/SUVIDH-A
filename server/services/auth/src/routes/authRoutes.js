const express = require("express");
const {
  requestOtpRateLimiter,
} = require("../middleware/requestOtpRateLimiter");

function createAuthRoutes(authController) {
  const router = express.Router();

  router.post("/request/otp", requestOtpRateLimiter, authController.requestOtp);
  router.post("/verify/otp", authController.verifyOtp);
  router.get("/profile/:mobile", authController.getProfile);

  return router;
}

module.exports = { createAuthRoutes };
