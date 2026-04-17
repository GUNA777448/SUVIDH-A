const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
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
  port: getNumber("PORT", 4005),
  appName: process.env.APP_NAME || "Payment Gateway Service",
  paymentPin: String(process.env.PAYMENT_GATEWAY_PIN || "1234").trim(),
  databaseUrl:
    process.env.PAYMENT_GATEWAY_SERVICE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "",
};

module.exports = { env };
