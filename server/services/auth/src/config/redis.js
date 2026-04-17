const axios = require("axios");
const { createClient } = require("redis");
const { env } = require("./env");

function createUpstashRestClient() {
  const baseUrl = env.upstashRedisRestUrl.replace(/\/$/, "");
  const headers = {
    Authorization: `Bearer ${env.upstashRedisRestToken}`,
  };

  async function execute(command, ...args) {
    const encodedArgs = args.map((arg) => encodeURIComponent(String(arg)));
    const url = `${baseUrl}/${command}/${encodedArgs.join("/")}`;
    const response = await axios.post(url, null, { headers, timeout: 7000 });
    return response.data?.result;
  }

  return {
    isOpen: true,
    on() {
      return undefined;
    },
    async connect() {
      return undefined;
    },
    async quit() {
      return undefined;
    },
    async ping() {
      await execute("ping");
      return "PONG";
    },
    async get(key) {
      return execute("get", key);
    },
    async set(key, value, options = {}) {
      if (options.EX) {
        await execute("set", key, value, "EX", options.EX);
        return "OK";
      }

      await execute("set", key, value);
      return "OK";
    },
    async del(key) {
      return Number(await execute("del", key));
    },
    async incr(key) {
      return Number(await execute("incr", key));
    },
    async expire(key, seconds) {
      return Number(await execute("expire", key, seconds));
    },
  };
}

let redisClient;

if (env.redisUrl) {
  redisClient = createClient({ url: env.redisUrl });
  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });
} else {
  redisClient = createUpstashRestClient();
}

module.exports = { redisClient };
