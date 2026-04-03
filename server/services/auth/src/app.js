const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const {
  rootHandler,
  healthHandler,
} = require("./controllers/systemController");
const { AuthController } = require("./controllers/authController");
const { UserRepository } = require("./repositories/userRepository");
const { OtpRepository } = require("./repositories/otpRepository");
const { EmailService } = require("./services/emailService");
const { AuthService } = require("./services/authService");
const { createRoutes } = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan("combined"));
  app.use(express.json({ limit: "1mb" }));

  const userRepository = new UserRepository();
  const otpRepository = new OtpRepository();
  const emailService = new EmailService();
  const authService = new AuthService(
    userRepository,
    otpRepository,
    emailService,
    env.otpRateLimitMax,
  );
  const authController = new AuthController(authService);

  app.locals.userRepository = userRepository;

  app.get("/", rootHandler);
  app.get("/health", healthHandler);
  app.use(createRoutes(authController));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
