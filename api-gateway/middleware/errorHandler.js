function errorHandler(err, req, res, next) {
  console.error("Gateway error:", err.message);
  res.status(500).json({
    success: false,
    message: "Gateway request failed",
  });
}

module.exports = { errorHandler };
