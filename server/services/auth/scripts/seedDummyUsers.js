const { pool } = require("../src/config/db");

async function run() {
  const users = [
    {
      name: "Gurunadha Rao",
      mobile: "9876543210",
      gmail: "gurunadharao5718@gmail.com",
      aadharnumber: "123412341234",
      consumer_id: "SUV-CN-1001",
    },
    {
      name: "Sravani Devi",
      mobile: "9123456780",
      gmail: "sravani.devi@example.com",
      aadharnumber: "223412341234",
      consumer_id: "SUV-CN-1002",
    },
    {
      name: "Ravi Teja",
      mobile: "9012345678",
      gmail: "ravi.teja@example.com",
      aadharnumber: "323412341234",
      consumer_id: "SUV-CN-1003",
    },
  ];

  for (const user of users) {
    await pool.query(
      `INSERT INTO users (name, mobile, gmail, aadharnumber, consumer_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (gmail)
       DO UPDATE SET
         name = EXCLUDED.name,
         mobile = EXCLUDED.mobile,
         aadharnumber = EXCLUDED.aadharnumber,
         consumer_id = EXCLUDED.consumer_id`,
      [user.name, user.mobile, user.gmail, user.aadharnumber, user.consumer_id],
    );
  }

  console.log("Seeded 3 dummy users");
}

run()
  .catch((error) => {
    console.error("Failed to seed users:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
