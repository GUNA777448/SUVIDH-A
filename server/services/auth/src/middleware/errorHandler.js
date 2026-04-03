const { HTTP_STATUS } = require("../constants/httpStatus");

function notFoundHandler(req, res) {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      path: req.originalUrl,
    },
  });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
