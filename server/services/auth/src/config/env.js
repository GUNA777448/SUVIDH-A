const fs = require("fs");
const path = require("path");

function loadEnvFile() {
  const envPath = path.resolve(__dirname, "..", "..", ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4009,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  otpProviderUrl: process.env.OTP_PROVIDER_URL,
  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS) || 300,
  otpRateLimitMax: Number(process.env.OTP_RATE_LIMIT_MAX) || 5,
  otpRateLimitWindowSeconds:
    Number(process.env.OTP_RATE_LIMIT_WINDOW_SECONDS) || 300,
  otpSecret: process.env.OTP_SECRET || process.env.JWT_SECRET || "change-me",
};

module.exports = { env };
