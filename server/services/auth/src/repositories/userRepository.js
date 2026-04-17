const { pool } = require("../config/db");

class UserRepository {
  async findById(id) {
    const query = `
      SELECT id, name, email, mobile, aadhar, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByMobile(mobile) {
    const query = `
      SELECT id, name, email, mobile, aadhar, created_at, updated_at
      FROM users
      WHERE mobile = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [mobile]);
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const query = `
      SELECT id, name, email, mobile, aadhar, created_at, updated_at
      FROM users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findByAadhar(aadhar) {
    if (!aadhar) {
      return null;
    }

    const query = `
      SELECT id, name, email, mobile, aadhar, created_at, updated_at
      FROM users
      WHERE aadhar = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [aadhar]);
    return result.rows[0] || null;
  }

  async registerUser(user) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const duplicateEmail = await client.query(
        `
          SELECT id, mobile
          FROM users
          WHERE lower(email) = lower($1)
          LIMIT 1
        `,
        [user.email],
      );

      if (
        duplicateEmail.rows[0] &&
        duplicateEmail.rows[0].mobile !== user.mobile
      ) {
        const error = new Error(
          "Email is already registered with another mobile",
        );
        error.code = "DUPLICATE_EMAIL";
        throw error;
      }

      if (user.aadhar) {
        const duplicateAadhar = await client.query(
          `
            SELECT id, mobile
            FROM users
            WHERE aadhar = $1
            LIMIT 1
          `,
          [user.aadhar],
        );

        if (
          duplicateAadhar.rows[0] &&
          duplicateAadhar.rows[0].mobile !== user.mobile
        ) {
          const error = new Error(
            "Aadhar is already registered with another mobile",
          );
          error.code = "DUPLICATE_AADHAR";
          throw error;
        }
      }

      const upsertResult = await client.query(
        `
          INSERT INTO users (name, email, mobile, aadhar)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (mobile)
          DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            aadhar = EXCLUDED.aadhar,
            updated_at = NOW()
          RETURNING
            id,
            name,
            email,
            mobile,
            aadhar,
            created_at,
            updated_at,
            (xmax = 0) AS created
        `,
        [user.name, user.email, user.mobile, user.aadhar || null],
      );

      const row = upsertResult.rows[0];

      if (row.created) {
        await client.query(
          `
            INSERT INTO auth_outbox_events (aggregate_type, aggregate_id, event_type, payload_json)
            VALUES ($1, $2, $3, $4::jsonb)
          `,
          [
            "user",
            row.id,
            "auth.user.registered",
            JSON.stringify({
              user_id: row.id,
              name: row.name,
              email: row.email,
              mobile: row.mobile,
              aadhar: row.aadhar,
              created_at: row.created_at,
            }),
          ],
        );
      }

      await client.query(
        `
          INSERT INTO auth_audit_log (user_id, event_type, metadata_json)
          VALUES ($1, $2, $3::jsonb)
        `,
        [
          row.id,
          row.created ? "auth.register.success" : "auth.register.idempotent",
          JSON.stringify({
            mobile: row.mobile,
            email: row.email,
            has_aadhar: Boolean(row.aadhar),
          }),
        ],
      );

      await client.query("COMMIT");

      return {
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          mobile: row.mobile,
          aadhar: row.aadhar,
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        created: row.created,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async upsert(user) {
    const query = `
      INSERT INTO users (name, email, mobile, aadhar)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (mobile)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        aadhar = EXCLUDED.aadhar,
        updated_at = NOW()
      RETURNING id, name, email, mobile, aadhar, created_at, updated_at
    `;

    const result = await pool.query(query, [
      user.name,
      user.email,
      user.mobile,
      user.aadhar || null,
    ]);

    return result.rows[0];
  }
}

module.exports = { UserRepository };
