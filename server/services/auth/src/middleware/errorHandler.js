function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found",
    },
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal Server Error",
      details: err.details || null,
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
