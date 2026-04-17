const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function getNumber(name, fallback) {
  const raw = process.env[name];
  if (!raw) {
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
  appName: process.env.APP_NAME || "SUVIDHA-API-GATEWAY",
  port: getNumber("PORT", 8080),
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:4009",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:4005",
};

const app = express();
const CORS_OPTIONS = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Idempotency-Key",
  ],
};

app.use(helmet());
app.use(cors(CORS_OPTIONS));
app.options("*", cors(CORS_OPTIONS));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: env.appName,
    time: new Date().toISOString(),
  });
});

app.use(
  "/api/v1/auth",
  createProxyMiddleware({
    target: env.authServiceUrl,
    changeOrigin: true,
    timeout: 10000,
    proxyTimeout: 10000,
    logLevel: "warn",
  }),
);

app.use(
  "/api/v1/payments",
  createProxyMiddleware({
    target: env.paymentServiceUrl,
    changeOrigin: true,
    timeout: 10000,
    proxyTimeout: 10000,
    logLevel: "warn",
  }),
);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Gateway route not configured",
  });
});

app.use((error, _req, res, _next) => {
  console.error("Gateway error:", error.message);
  res.status(502).json({
    success: false,
    message: "Bad gateway",
  });
});

app.listen(env.port, () => {
  console.log(`${env.appName} listening on port ${env.port}`);
  console.log(`Proxy /api/v1/auth -> ${env.authServiceUrl}`);
  console.log(`Proxy /api/v1/payments -> ${env.paymentServiceUrl}`);
});
