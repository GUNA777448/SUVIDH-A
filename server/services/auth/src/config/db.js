const { Pool } = require("pg");
const { env } = require("./env");

function buildDatabaseConfig() {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  let connectionString = env.databaseUrl;
  let ssl;

  try {
    const parsed = new URL(env.databaseUrl);
    const isSupabaseHost = /(?:^|\.)supabase\.(?:co|com)$/i.test(
      parsed.hostname,
    );

    if (isSupabaseHost) {
      if (!parsed.searchParams.has("sslmode")) {
        parsed.searchParams.set("sslmode", "require");
      }
      if (!parsed.searchParams.has("uselibpqcompat")) {
        parsed.searchParams.set("uselibpqcompat", "true");
      }

      connectionString = parsed.toString();
      ssl = { rejectUnauthorized: false };
    }
  } catch {
    // Keep original connection string when URL parsing fails.
  }

  return {
    connectionString,
    ...(ssl ? { ssl } : {}),
  };
}

const pool = new Pool(buildDatabaseConfig());

module.exports = { pool };
