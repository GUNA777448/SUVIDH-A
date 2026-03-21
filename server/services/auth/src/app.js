const express = require("express");
const authRoutes = require("./routes/authRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ service: "auth", status: "running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
app.use("/auth", authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
