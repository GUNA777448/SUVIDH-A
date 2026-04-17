const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function getNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${name}: ${raw}`);
  }

  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: getNumber("PORT", 4009),
  appName: process.env.APP_NAME || "SUVIDHA",
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  otpServiceUrl: process.env.OTP_SERVICE_URL || process.env.OTP_PROVIDER_URL,
  emailOtpServiceUrl:
    process.env.EMAIL_OTP_SERVICE_URL || process.env.OTP_PROVIDER_URL,
  otpExpirySeconds: getNumber("OTP_EXPIRY_SECONDS", 300),
  otpRequestWindowSeconds: getNumber("OTP_REQUEST_WINDOW_SECONDS", 300),
  otpRequestMaxPerWindow: getNumber("OTP_REQUEST_MAX_PER_WINDOW", 3),
  otpVerifyMaxAttempts: getNumber("OTP_VERIFY_MAX_ATTEMPTS", 5),
};

const missing = [];
if (!env.databaseUrl) missing.push("DATABASE_URL");
const hasRedisUrl = Boolean(env.redisUrl);
const hasUpstashRest =
  Boolean(env.upstashRedisRestUrl) && Boolean(env.upstashRedisRestToken);
if (!hasRedisUrl && !hasUpstashRest) {
  missing.push(
    "REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN",
  );
}
if (!env.otpServiceUrl) missing.push("OTP_SERVICE_URL or OTP_PROVIDER_URL");

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
}

module.exports = { env };
