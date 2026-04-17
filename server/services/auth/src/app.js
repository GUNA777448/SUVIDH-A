const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { authRouter } = require("./routes/authRoutes");

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

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = { app };
