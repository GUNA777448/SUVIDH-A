const fs = require("fs");
const path = require("path");
const { app } = require("./app");
const { env } = require("./config/env");
const { pool } = require("./config/db");
const { redisClient } = require("./config/redis");

let server;

async function initDb() {
  const sqlPath = path.resolve(__dirname, "db", "init.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}

async function start() {
  await pool.query("SELECT 1");
  await initDb();

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  await redisClient.ping();

  server = app.listen(env.port, () => {
    console.log(`${env.appName} auth service listening on port ${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error("Failed to start auth service:", error.message);
  process.exit(1);
});
