#!/usr/bin/env node

const { resolveServices } = require("./config");
const { readMigrationFiles } = require("./helpers");

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

  let total = 0;
  for (const service of services) {
    const { pairs } = readMigrationFiles(service);
    total += pairs.length;
    console.log(`[ok] ${service.name}: ${pairs.length} migration pair(s)`);
  }

  console.log(
    `Validated ${services.length} service(s), ${total} migration pair(s).`,
  );
}

try {
  main();
} catch (error) {
  console.error(`[error] ${error.message}`);
  process.exit(1);
}
