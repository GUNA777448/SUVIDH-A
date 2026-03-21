const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_TTL_SECONDS = 5 * 60;
const { otpProviderUrl } = require("../config/env");
const { redis, ensureRedisConnection } = require("../lib/redis");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function keyFor(identifierType, identifierValue) {
  return `${identifierType}:${identifierValue}`;
}

async function issueOtp(identifierType, identifierValue, consumerId) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await ensureRedisConnection();
  await redis.set(
    keyFor(identifierType, identifierValue),
    JSON.stringify({
      otp,
      expiresAt: expiresAt.toISOString(),
      consumerId,
    }),
    "EX",
    OTP_TTL_SECONDS,
  );

  return {
    otp,
    expiresAt: expiresAt.toISOString(),
  };
}

async function verifyOtp(identifierType, identifierValue, otp, consumerId) {
  const key = keyFor(identifierType, identifierValue);

  await ensureRedisConnection();
  const challengeRaw = await redis.get(key);

  if (!challengeRaw) {
    return {
      ok: false,
      code: "OTP_NOT_FOUND",
      message: "OTP not found, expired, or already used",
    };
  }

  const challenge = JSON.parse(challengeRaw);

  if (challenge.consumerId !== consumerId) {
    return {
      ok: false,
      code: "OTP_IDENTIFIER_MISMATCH",
      message: "OTP does not match identifier",
    };
  }

  if (challenge.otp !== otp) {
    return { ok: false, code: "OTP_INVALID", message: "Invalid OTP" };
  }

  await redis.del(key);
  return { ok: true };
}

async function sendOtpEmail({ email, name, otp }) {
  const url = new URL(otpProviderUrl);
  url.searchParams.set("email", email);
  url.searchParams.set("name", name);
  url.searchParams.set("otp", otp);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `OTP provider request failed: ${response.status} ${bodyText}`,
    );
  }

  return true;
}

module.exports = {
  generateOtp,
  issueOtp,
  verifyOtp,
  sendOtpEmail,
};
