#!/usr/bin/env node

const path = require("path");
const { resolveServices } = require("./config");
const {
  readMigrationFiles,
  getDbUrl,
  runPsql,
  ensureMigrationsTable,
  getAppliedMigrationIds,
  normalizePathForPsql,
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
      console.log(`[skip] ${service.name}: ${service.envVar} not set`);
      continue;
    }

    const { migrationDir, pairs } = readMigrationFiles(service);
    ensureMigrationsTable(dbUrl);
    const applied = new Set(getAppliedMigrationIds(dbUrl));
    const pending = pairs.filter((migration) => !applied.has(migration.id));

    if (pending.length === 0) {
      console.log(`[skip] ${service.name}: no pending migrations`);
      continue;
    }

    console.log(`[dry-run] ${service.name}: ${pending.length} migration(s)`);
    for (const migration of pending) {
      const upFile = normalizePathForPsql(
        path.join(migrationDir, migration.up),
      );
      const dryRunInput = `BEGIN;\n\\i '${upFile}'\nROLLBACK;\n`;
      runPsql({ dbUrl, input: dryRunInput, silent: true });
      console.log(`  [ok] ${service.name}: ${migration.id}`);
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
