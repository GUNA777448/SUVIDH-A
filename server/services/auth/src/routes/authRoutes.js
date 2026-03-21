const express = require("express");
const { requestOtp, verifyOtp } = require("../controllers/authController");

const router = express.Router();

router.post("/login/otp", requestOtp);
router.post("/login/verify", verifyOtp);

module.exports = router;
