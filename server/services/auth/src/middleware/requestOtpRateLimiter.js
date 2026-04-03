const rateLimit = require("express-rate-limit");

const requestOtpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "IP_RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please slow down.",
    },
  },
});

module.exports = {
  requestOtpRateLimiter,
};
