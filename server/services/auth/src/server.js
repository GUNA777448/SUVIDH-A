const { createApp } = require("./app");
const { env } = require("./config/env");
const { pool } = require("./config/db");
const { redisClient } = require("./config/redis");

let httpServer;

async function initializeDependencies(app) {
  await pool.query("SELECT 1");
  app.locals.dbConnected = true;
  console.log("PostgreSQL connection established");

  const userRepository = app.locals.userRepository;
  await userRepository.initialize();
  console.log("Users table initialized");

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  await redisClient.ping();
  app.locals.redisConnected = true;
  console.log("Redis connection established");
}

async function startServer() {
  const app = createApp();
  app.locals.dbConnected = false;
  app.locals.redisConnected = false;

  await initializeDependencies(app);

  httpServer = app.listen(env.port, () => {
    console.log(`Auth service listening on port ${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down auth service...`);

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }

  await pool.end();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }

  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer().catch((error) => {
  console.error("Failed to start auth service:", error.message);
  process.exit(1);
});
