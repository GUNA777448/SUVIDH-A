const port = Number(process.env.PORT) || 4009;
const jwtSecret = process.env.JWT_SECRET || "change_me";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
const otpProviderUrl =
  process.env.OTP_PROVIDER_URL ||
  "https://script.google.com/macros/s/AKfycbwVaewijYkVjInBkoLBWXy5c-FYSWJqc4BR0URsNO1Pu_wlDH6XwpSPkgRS1diVBbd07w/exec";
const redisUrl = process.env.REDIS_URL || process.env.REID_URL || "";

module.exports = {
  port,
  jwtSecret,
  jwtExpiresIn,
  otpProviderUrl,
  redisUrl,
};
