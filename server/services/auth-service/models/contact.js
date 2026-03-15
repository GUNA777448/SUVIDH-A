// Contact model for user contact details
// Table: contact
// Columns: id (PK), user_id (FK), address, city, state, pincode, phone, email, created_at

const { pool } = require("./auth");

const createContactTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES profile(id),
      address TEXT,
      city VARCHAR(64),
      state VARCHAR(64),
      pincode VARCHAR(16),
      phone VARCHAR(16),
      email VARCHAR(128),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
module.exports = {
  createContactTable,
};