// Profile model for user basic details
// Table: profile
// Columns: id (PK), name, dob, gender, created_at

const { pool } = require("./auth");

const createProfileTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profile (
      id SERIAL PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      dob DATE,
      gender VARCHAR(16),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

module.exports = {
  createProfileTable,
};
