// OTP Service: Generates and verifies OTPs
const crypto = require("crypto");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

function sendOTP(mobile, otp) {
  // Integrate with SMS gateway here
  console.log(`Sending OTP ${otp} to mobile ${mobile}`);
  // In production, replace with actual SMS sending logic
}

module.exports = {
  generateOTP,
  sendOTP,
};
