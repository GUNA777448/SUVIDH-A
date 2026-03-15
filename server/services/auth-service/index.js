const express = require("express");
const app = express();
const PORT = process.env.PORT || 4009;
const authRoutes = require("./routes/authRoutes");
const { createAuthTable } = require("./models/auth");
const { createProfileTable } = require("./models/profile");
const { createContactTable } = require("./models/contact");

app.use(express.json());

// Check DB connection and initialize tables
(async () => {
  const { pool } = require("./models/auth");
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection successful");
    await createAuthTable();
    await createProfileTable();
    await createContactTable();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();


app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Auth Service is running!");
});
app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
});
