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
    const applied = getAppliedMigrationIds(dbUrl);
    const latestApplied = applied[applied.length - 1];

    if (!latestApplied) {
      console.log(`[skip] ${service.name}: no applied migrations`);
      continue;
    }

    const target = pairs.find((migration) => migration.id === latestApplied);
    if (!target) {
      throw new Error(
        `Latest applied migration ${latestApplied} not found in ${service.name} migration folder`,
      );
    }

    const downFile = path.join(migrationDir, target.down);
    runPsql({ dbUrl, args: ["-f", downFile], silent: true });
    runPsql({
      dbUrl,
      args: ["-c", `DELETE FROM schema_migrations WHERE id = '${target.id}';`],
      silent: true,
    });

    console.log(`[rolled-back] ${service.name}: ${target.id}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
