const { UserRepository } = require("../repositories/userRepository");
const { createAccessToken } = require("../lib/jwt");
const { toSafeUser } = require("../lib/mask");
const { env } = require("../config/env");
const {
  generateOtp,
  normalizeMobile,
  enforceOtpRequestRateLimit,
  storeOtp,
  sendSmsOtp,
  sendEmailOtpIfEnabled,
  verifyOtpWithAttemptLimit,
} = require("../services/otpService");

const userRepository = new UserRepository();

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeAadhar(value) {
  const raw = String(value || "").replace(/\D/g, "");
  return raw || null;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidAadhar(value) {
  return /^\d{12}$/.test(value);
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      mobile: rawMobile,
      aadhar: rawAadhar,
    } = req.body || {};

    const normalizedName = String(name || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = normalizeMobile(rawMobile);
    const normalizedAadhar = normalizeAadhar(rawAadhar);

    if (!normalizedName) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid email is required" });
    }

    if (normalizedMobile.length !== 10) {
      return res
        .status(400)
        .json({ success: false, message: "Valid 10-digit mobile is required" });
    }

    if (normalizedAadhar && !isValidAadhar(normalizedAadhar)) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhar must be a 12-digit number" });
    }

    const registration = await userRepository.registerUser({
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      aadhar: normalizedAadhar,
    });

    return res.status(registration.created ? 201 : 200).json({
      success: true,
      message: registration.created
        ? "User registered successfully"
        : "User already registered. Existing profile returned",
      data: {
        user: toSafeUser(registration.user),
        created: registration.created,
      },
    });
  } catch (error) {
    if (error.code === "DUPLICATE_EMAIL" || error.code === "DUPLICATE_AADHAR") {
      return res.status(409).json({ success: false, message: error.message });
    }

    return next(error);
  }
}

async function login(req, res) {
  const { identifier, value } = req.body || {};

  if (identifier !== "M" || !value) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid payload. Use { identifier: 'M', value: '<mobile_number>' }",
    });
  }

  const mobile = normalizeMobile(value);
  if (mobile.length < 10) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid mobile number" });
  }

  const user = await userRepository.findByMobile(mobile);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await enforceOtpRequestRateLimit(mobile);

  const otp = generateOtp();
  await storeOtp(mobile, otp);

  let smsSent = false;
  let emailSent = false;
  let lastDeliveryError;

  try {
    smsSent = await sendSmsOtp(mobile, otp);
  } catch (error) {
    lastDeliveryError = error;
    console.warn("Primary OTP channel failed:", error.message);
  }

  emailSent = await sendEmailOtpIfEnabled(user, otp);

  if (!smsSent && !emailSent) {
    throw new Error(
      lastDeliveryError?.message ||
        "Unable to deliver OTP through any configured channel",
    );
  }

  return res.status(200).json({
    success: true,
    message: smsSent
      ? "OTP sent successfully"
      : "OTP sent successfully via email fallback",
    data: {
      mobile: toSafeUser(user).mobile,
      otp_expiry_seconds: env.otpExpirySeconds,
    },
  });
}

async function verifyOtp(req, res) {
  const { mobile: rawMobile, otp } = req.body || {};

  if (!rawMobile || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "mobile and otp are required" });
  }

  const mobile = normalizeMobile(rawMobile);
  const user = await userRepository.findByMobile(mobile);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const verification = await verifyOtpWithAttemptLimit(mobile, String(otp));
  if (!verification.ok) {
    return res
      .status(401)
      .json({ success: false, message: verification.message });
  }

  const token = createAccessToken(user);

  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    data: {
      token,
      user: toSafeUser(user),
    },
  });
}

async function getProfile(req, res) {
  const mobile = normalizeMobile(req.params.mobile);

  if (!mobile || mobile.length < 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid mobile number",
    });
  }

  const user = await userRepository.findByMobile(mobile);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    data: {
      message: "Profile fetched successfully",
      user: toSafeUser(user),
    },
  });
}

async function getProfileByUserId(req, res) {
  const userId = (req.params.userId || "").trim();

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required",
    });
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    data: {
      message: "Profile fetched successfully",
      user: toSafeUser(user),
    },
  });
}

module.exports = { register, login, verifyOtp, getProfile, getProfileByUserId };
