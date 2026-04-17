const { PrismaClient } = require("../generated/prisma");

let prisma;

if (!globalThis.__suvidhaAuthPrisma) {
  globalThis.__suvidhaAuthPrisma = new PrismaClient();
}

prisma = globalThis.__suvidhaAuthPrisma;

module.exports = { prisma };
