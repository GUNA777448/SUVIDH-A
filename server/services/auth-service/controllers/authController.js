// Auth Controller: Handles login and OTP verification
const jwt = require("jsonwebtoken");
const { pool } = require("../models/auth");
const { generateOTP, sendOTP } = require("../services/otpService");

const JWT_SECRET = process.env.JWT_SECRET || "suvidha_secret";

// Step 1: Request OTP
async function requestOTP(req, res) {
  const { identifier_type, identifier_value } = req.body;
  if (!identifier_type || !identifier_value) {
    return res
      .status(400)
      .json({ error: "Identifier type and value required" });
  }
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  await pool.query(
    "INSERT INTO auth (identifier_type, identifier_value, otp, otp_expires_at) VALUES ($1, $2, $3, $4) ON CONFLICT (identifier_type, identifier_value) DO UPDATE SET otp = $3, otp_expires_at = $4",
    [identifier_type, identifier_value, otp, otpExpires],
  );
  if (identifier_type === "mobile") sendOTP(identifier_value, otp);
  return res.json({ message: "OTP sent" });
}

// Step 2: Verify OTP and login
async function verifyOTP(req, res) {
  const { identifier_type, identifier_value, otp } = req.body;
  if (!identifier_type || !identifier_value || !otp) {
    return res.status(400).json({ error: "All fields required" });
  }
  const result = await pool.query(
    "SELECT * FROM auth WHERE identifier_type = $1 AND identifier_value = $2",
    [identifier_type, identifier_value],
  );
  const user = result.rows[0];
  if (!user || user.otp !== otp || new Date() > user.otp_expires_at) {
    return res.status(401).json({ error: "Invalid or expired OTP" });
  }
  // Generate JWT
  const token = jwt.sign(
    { id: user.id, identifier_type, identifier_value },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
  await pool.query("UPDATE auth SET jwt_token = $1 WHERE id = $2", [
    token,
    user.id,
  ]);
  return res.json({ token });
}

module.exports = {
  requestOTP,
  verifyOTP,
};
