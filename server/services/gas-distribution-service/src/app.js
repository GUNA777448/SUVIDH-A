const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { env } = require("./config/env");
const { query } = require("./config/db");
const { gasDistributionRouter } = require("./routes/gasDistributionRoutes");

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
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.status(200).json({
      status: "ok",
      service: env.appName,
      domain: "gas-distribution",
      port: env.port,
      database: "up",
    });
  } catch (_error) {
    res.status(503).json({
      status: "degraded",
      service: env.appName,
      domain: "gas-distribution",
      port: env.port,
      database: "down",
    });
  }
});

app.use("/api/v1/gas-distribution", gasDistributionRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = { app };
