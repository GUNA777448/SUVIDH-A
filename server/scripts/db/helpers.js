const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { SERVICES_ROOT } = require("./config");

const MIGRATION_REGEX = /^\d{14}_[a-z0-9_]+\.(up|down)\.sql$/;

function getMigrationDir(service) {
  return path.join(SERVICES_ROOT, service.dir, "migrations");
}

function ensureMigrationDir(service) {
  const migrationDir = getMigrationDir(service);
  if (!fs.existsSync(migrationDir)) {
    throw new Error(`Missing migrations directory: ${migrationDir}`);
  }
  return migrationDir;
}

function readMigrationFiles(service) {
  const migrationDir = ensureMigrationDir(service);
  const entries = fs
    .readdirSync(migrationDir)
    .filter((name) => name.endsWith(".sql"));

  const invalid = entries.filter((name) => !MIGRATION_REGEX.test(name));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid migration file names in ${service.name}: ${invalid.join(", ")} (expected: YYYYMMDDHHMMSS_name.up.sql or .down.sql)`,
    );
  }

  const pairs = new Map();
  for (const name of entries) {
    const [id, ...rest] = name.split("_");
    const suffix = rest.join("_");
    const key = `${id}_${suffix.replace(".up.sql", "").replace(".down.sql", "")}`;
    const item = pairs.get(key) || { id: key, up: null, down: null };

    if (name.endsWith(".up.sql")) {
      item.up = name;
    }
    if (name.endsWith(".down.sql")) {
      item.down = name;
    }

    pairs.set(key, item);
  }

  const pairList = [...pairs.values()].sort((a, b) => a.id.localeCompare(b.id));
  const missingPair = pairList.filter((item) => !item.up || !item.down);
  if (missingPair.length > 0) {
    throw new Error(
      `Missing up/down migration pair in ${service.name}: ${missingPair
        .map((item) => item.id)
        .join(", ")}`,
    );
  }

  return {
    migrationDir,
    pairs: pairList,
  };
}

function getDbUrl(service) {
  return process.env[service.envVar] || "";
}

function runPsql({ dbUrl, args = [], input, silent = false }) {
  const commandArgs = ["-v", "ON_ERROR_STOP=1", dbUrl, ...args];
  const result = spawnSync("psql", commandArgs, {
    encoding: "utf8",
    input,
  });

  if (result.error) {
    throw new Error(`Failed to execute psql: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    throw new Error(`psql failed (exit ${result.status}): ${stderr || stdout}`);
  }

  if (!silent && result.stdout) {
    process.stdout.write(result.stdout);
  }

  return result.stdout || "";
}

function ensureMigrationsTable(dbUrl) {
  runPsql({
    dbUrl,
    args: [
      "-c",
      "CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());",
    ],
    silent: true,
  });
}

function getAppliedMigrationIds(dbUrl) {
  const output = runPsql({
    dbUrl,
    args: [
      "-t",
      "-A",
      "-c",
      "SELECT id FROM schema_migrations ORDER BY id ASC;",
    ],
    silent: true,
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizePathForPsql(filePath) {
  return filePath.replace(/\\/g, "/");
}

module.exports = {
  MIGRATION_REGEX,
  getMigrationDir,
  readMigrationFiles,
  getDbUrl,
  runPsql,
  ensureMigrationsTable,
  getAppliedMigrationIds,
  normalizePathForPsql,
};
