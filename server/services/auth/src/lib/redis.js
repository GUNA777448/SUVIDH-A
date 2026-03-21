const Redis = require("ioredis");
const { redisUrl } = require("../config/env");

function normalizeRedisUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  let cleaned = rawUrl.trim();

  if (cleaned.includes("-u ")) {
    cleaned = cleaned.split("-u ").pop().trim();
  }

  cleaned = cleaned.replace(/^['\"]|['\"]$/g, "");

  if (cleaned.startsWith("redis://")) {
    cleaned = cleaned.replace("redis://", "rediss://");
  }

  return cleaned;
}

const resolvedRedisUrl = normalizeRedisUrl(redisUrl);

const redis = new Redis(resolvedRedisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableOfflineQueue: false,
});

let connected = false;

async function ensureRedisConnection() {
  if (connected) {
    return;
  }

  await redis.connect();
  connected = true;
}

module.exports = {
  redis,
  ensureRedisConnection,
  normalizeRedisUrl,
};
