const axios = require("axios");
const { env } = require("../config/env");
const { redisClient } = require("../config/redis");

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeMobile(value) {
  return String(value || "").replace(/\D/g, "");
}

async function enforceOtpRequestRateLimit(mobile) {
  const key = `otp_req:${mobile}`;
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, env.otpRequestWindowSeconds);
  }

  if (count > env.otpRequestMaxPerWindow) {
    throw new Error("Too many OTP requests. Please try again later.");
  }
}

async function storeOtp(mobile, otp) {
  const key = `otp:${mobile}`;
  await redisClient.set(key, otp, { EX: env.otpExpirySeconds });
  await redisClient.del(`otp_attempts:${mobile}`);
}

async function sendSmsOtp(mobile, otp) {
  const payload = {
    appName: env.appName,
    mobile,
    otp,
    expirySeconds: env.otpExpirySeconds,
  };

  await axios.post(env.otpServiceUrl, payload, {
    timeout: 7000,
    headers: { "Content-Type": "application/json" },
  });

  return true;
}

async function sendEmailOtpIfEnabled(user, otp) {
  if (!env.emailOtpServiceUrl || !user?.email) {
    return false;
  }

  try {
    await axios.post(
      env.emailOtpServiceUrl,
      {
        appName: env.appName,
        email: user.email,
        name: user.name,
        otp,
      },
      {
        timeout: 7000,
        headers: { "Content-Type": "application/json" },
      },
    );
    return true;
  } catch (error) {
    console.warn("Optional email OTP send failed:", error.message);
    return false;
  }
}

async function verifyOtpWithAttemptLimit(mobile, inputOtp) {
  const otpKey = `otp:${mobile}`;
  const attemptsKey = `otp_attempts:${mobile}`;

  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    return { ok: false, message: "OTP expired or not found" };
  }

  if (storedOtp !== inputOtp) {
    const attempts = await redisClient.incr(attemptsKey);
    if (attempts === 1) {
      await redisClient.expire(attemptsKey, env.otpExpirySeconds);
    }

    if (attempts >= env.otpVerifyMaxAttempts) {
      await redisClient.del(otpKey);
      await redisClient.del(attemptsKey);
      return { ok: false, message: "Too many invalid OTP attempts" };
    }

    return { ok: false, message: "Invalid OTP" };
  }

  await redisClient.del(otpKey);
  await redisClient.del(attemptsKey);
  return { ok: true };
}

module.exports = {
  generateOtp,
  normalizeMobile,
  enforceOtpRequestRateLimit,
  storeOtp,
  sendSmsOtp,
  sendEmailOtpIfEnabled,
  verifyOtpWithAttemptLimit,
};
