const { pool } = require("../config/db");

class UserRepository {
  async initialize() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        mobile VARCHAR(20) NOT NULL UNIQUE,
        gmail TEXT NOT NULL UNIQUE,
        aadharnumber VARCHAR(20) NOT NULL UNIQUE,
        consumer_id VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_gmail ON users(gmail)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_consumer_id ON users(consumer_id)",
    );
    await pool.query(
      "CREATE INDEX IF NOT EXISTS idx_users_aadhar ON users(aadharnumber)",
    );
  }

  
  async findByEmail(gmail) {
    const result = await pool.query(
      `SELECT id, name, mobile, gmail, aadharnumber, consumer_id, created_at
       FROM users
       WHERE gmail = $1`,
      [gmail],
    );

    return result.rows[0] || null;
  }

  async findByMobile(mobile) {
    const result = await pool.query(
      `SELECT id, name, mobile, gmail, aadharnumber, consumer_id, created_at
       FROM users
       WHERE mobile = $1`,
      [mobile],
    );

    return result.rows[0] || null;
  }

  async createUser(payload) {
    const {
      name,
      mobile,
      gmail,
      aadharnumber,
      consumer_id: consumerId,
    } = payload;

    const result = await pool.query(
      `INSERT INTO users (name, mobile, gmail, aadharnumber, consumer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, mobile, gmail, aadharnumber, consumer_id, created_at`,
      [name, mobile, gmail, aadharnumber, consumerId],
    );

    return result.rows[0];
  }
}

module.exports = { UserRepository };
