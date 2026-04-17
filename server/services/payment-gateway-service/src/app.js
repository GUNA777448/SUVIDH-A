const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { env } = require("./config/env");
const { paymentRouter } = require("./routes/paymentRoutes");

const app = express();
const ALLOWED_ORIGINS = new Set([
  "https://suvidh-a.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://m5z408t6-5173.inc1.devtunnels.ms",
]);

const CORS_OPTIONS = {
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
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

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: env.appName,
    domain: "payment",
    port: env.port,
    mode: "proxy",
  });
});

app.use("/api/v1/payments", paymentRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = { app };
