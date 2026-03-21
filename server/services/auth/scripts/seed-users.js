require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  {
    consumerId: "10000001",
    fullName: "guna",
    dob: new Date("2002-01-15"),
    gender: "M",
    mobile: "6300614592",
    aadhar: "123456789012",
    email: "gurunadharao5718@gmail.com",
  },
  {
    consumerId: "10000002",
    fullName: "ananya reddy",
    dob: new Date("1998-08-09"),
    gender: "F",
    mobile: "9123456780",
    aadhar: "987654321098",
    email: "ananya.reddy@example.com",
  },
  {
    consumerId: "10000003",
    fullName: "rahul varma",
    dob: new Date("1995-03-21"),
    gender: "M",
    mobile: "9876501234",
    aadhar: "456789123456",
    email: "rahul.varma@example.com",
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { consumerId: user.consumerId },
      update: {
        fullName: user.fullName,
        dob: user.dob,
        gender: user.gender,
        mobile: user.mobile,
        aadhar: user.aadhar,
        email: user.email,
      },
      create: user,
    });
  }

  console.log(`Seeded ${users.length} users successfully.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed users:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
