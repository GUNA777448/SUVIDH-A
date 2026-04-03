const { createClient } = require("redis");
const { env } = require("./env");

function resolveRedisUrl() {
  if (!env.redisUrl) {
    throw new Error("REDIS_URL is not configured");
  }

  const match = env.redisUrl.match(/redis:\/\/\S+/);
  return match ? match[0] : env.redisUrl;
}

const redisUrl = resolveRedisUrl();
const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: redisUrl.startsWith("rediss://") || redisUrl.includes("upstash.io"),
  },
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

module.exports = { redisClient };