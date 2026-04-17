#!/usr/bin/env node

const path = require("path");
const { resolveServices } = require("./config");
const {
  readMigrationFiles,
  getDbUrl,
  runPsql,
  ensureMigrationsTable,
  getAppliedMigrationIds,
} = require("./helpers");

function parseSelectedServices(argv) {
  const serviceArg = argv.find((arg) => arg.startsWith("--services="));
  if (!serviceArg) {
    return [];
  }
  return serviceArg
    .slice("--services=".length)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function main() {
  const selected = parseSelectedServices(process.argv.slice(2));
  const services = resolveServices(selected);

  for (const service of services) {
    const dbUrl = getDbUrl(service);
    if (!dbUrl) {
      throw new Error(`Missing ${service.envVar} for ${service.name}`);
    }

    const { migrationDir, pairs } = readMigrationFiles(service);
    ensureMigrationsTable(dbUrl);
    const applied = new Set(getAppliedMigrationIds(dbUrl));

    const pending = pairs.filter((migration) => !applied.has(migration.id));
    if (pending.length === 0) {
      console.log(`[skip] ${service.name}: no pending migrations`);
      continue;
    }

    console.log(
      `[run] ${service.name}: applying ${pending.length} migration(s)`,
    );
    for (const migration of pending) {
      const upFile = path.join(migrationDir, migration.up);
      runPsql({ dbUrl, args: ["-f", upFile], silent: true });
      runPsql({
        dbUrl,
        args: [
          "-c",
          `INSERT INTO schema_migrations (id) VALUES ('${migration.id}') ON CONFLICT (id) DO NOTHING;`,
        ],
        silent: true,
      });
      console.log(`  [applied] ${service.name}: ${migration.id}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
