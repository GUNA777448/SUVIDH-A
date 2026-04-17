const { pool } = require("../src/config/db");

async function seedUsers() {
  const users = [
    {
      name: "Gurunadha Rao",
      email: "gurunadharao5718@gmail.com",
      mobile: "6300614592",
      aadhar: null,
    },
    {
      name: "Asha Devi",
      email: "asha.devi@example.com",
      mobile: "9876543210",
      aadhar: "123412341234",
    },
    {
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      mobile: "9123456780",
      aadhar: null,
    },
  ];

  for (const user of users) {
    await pool.query(
      `
      INSERT INTO users (name, email, mobile, aadhar)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (mobile)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        aadhar = EXCLUDED.aadhar,
        updated_at = NOW()
      `,
      [user.name, user.email, user.mobile, user.aadhar],
    );
  }

  console.log(`Seeded ${users.length} users`);
}

seedUsers()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    await pool.end();
    process.exit(1);
  });
