const crypto = require("crypto");
const { env } = require("../config/env");

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(email, otp) {
  return crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${env.otpSecret}`)
    .digest("hex");
}

module.exports = {
  generateOtp,
  hashOtp,
};
