// Auth model for authentication related data
// This is a basic schema definition for NeonDB (PostgreSQL)

require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
});

// Table: auth
// Columns: id (PK), identifier_type, identifier_value, otp, otp_expires_at, jwt_token, created_at

const createAuthTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth (
      id SERIAL PRIMARY KEY,
      identifier_type VARCHAR(32) NOT NULL, -- mobile, aadhar, consumerid
      identifier_value VARCHAR(64) NOT NULL,
      otp VARCHAR(6),
      otp_expires_at TIMESTAMP,
      jwt_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

module.exports = {
  pool,
  createAuthTable,
};
