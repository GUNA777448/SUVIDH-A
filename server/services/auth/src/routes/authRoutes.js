const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  login,
  verifyOtp,
  getProfile,
  getProfileByUserId,
} = require("../controllers/authController");

const authRouter = express.Router();

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait before retrying.",
  },
});

authRouter.post("/register", register);
authRouter.post("/login", otpRequestLimiter, login);
authRouter.post("/verify/otp", verifyOtp);
authRouter.get("/profile/userid=:userId", getProfileByUserId);
authRouter.get("/profile/userid/:userId", getProfileByUserId);
authRouter.get("/profile/:mobile(\\d{10})", getProfile);

module.exports = { authRouter };
