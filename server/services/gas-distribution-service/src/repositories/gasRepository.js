const { randomUUID } = require("crypto");
const { pool, query } = require("../config/db");

function nextNumber(prefix) {
  const serial = Date.now().toString().slice(-8);
  const rand = randomUUID().slice(0, 6).toUpperCase();
  return `${prefix}-${serial}-${rand}`;
}

async function findDistributorByCode(distributorCode) {
  if (!distributorCode) return null;
  const result = await query(
    `SELECT * FROM gas_distributors WHERE distributor_code = $1 LIMIT 1`,
    [distributorCode],
  );
  return result.rows[0] || null;
}

async function upsertUserProfile(input) {
  const result = await query(
    `INSERT INTO gas_user_profiles (
      auth_user_id,
      full_name,
      mobile_number,
      email,
      aadhar_ref,
      profile_state,
      last_synced_at
    )
    VALUES ($1, $2, $3, $4, $5, 'active', NOW())
    ON CONFLICT (auth_user_id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      mobile_number = EXCLUDED.mobile_number,
      email = EXCLUDED.email,
      aadhar_ref = EXCLUDED.aadhar_ref,
      last_synced_at = NOW()
    RETURNING *`,
    [
      input.auth_user_id,
      input.full_name,
      String(input.mobile_number),
      input.email || null,
      input.aadhaar_ref || null,
    ],
  );

  return result.rows[0];
}

async function createCustomer(input) {
  const profile = await upsertUserProfile(input);
  const distributor = await findDistributorByCode(input.distributor_code);
  const customerNumber = nextNumber("GAS-CUS");
  const result = await query(
    `INSERT INTO gas_customers (
      auth_user_id,
      user_profile_id,
      customer_number,
      full_name,
      mobile_number,
      email,
      address_line,
      pincode,
      state,
      aadhaar_ref,
      subsidy_opt_in,
      default_distributor_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      input.auth_user_id,
      profile.id,
      customerNumber,
      input.full_name,
      String(input.mobile_number),
      input.email || null,
      input.address_line,
      String(input.pincode),
      input.state,
      input.aadhaar_ref || null,
      Boolean(input.subsidy_opt_in),
      distributor ? distributor.id : null,
    ],
  );

  return result.rows[0];
}

async function createConnection(input) {
  const distributor = await findDistributorByCode(input.distributor_code);
  const result = await query(
    `INSERT INTO gas_connections (
      customer_id,
      connection_type,
      distributor_id,
      connection_status,
      kyc_status
    )
    VALUES ($1, $2, $3, 'pending', 'pending')
    RETURNING *`,
    [
      input.customer_id,
      input.connection_type || "domestic",
      distributor ? distributor.id : null,
    ],
  );

  return result.rows[0];
}

async function listDistributors(filters) {
  const clauses = [];
  const params = [];

  if (filters.state) {
    params.push(filters.state);
    clauses.push(`state = $${params.length}`);
  }
  if (filters.pincode) {
    params.push(filters.pincode);
    clauses.push(`pincode = $${params.length}`);
  }
  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    clauses.push(`is_active = $${params.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `SELECT *
     FROM gas_distributors
     ${where}
     ORDER BY service_quality_score DESC, name ASC`,
    params,
  );

  return result.rows;
}

async function findCustomerById(customerId) {
  const result = await query(
    `SELECT * FROM gas_customers WHERE id = $1 LIMIT 1`,
    [customerId],
  );
  return result.rows[0] || null;
}

async function findConnectionById(connectionId) {
  const result = await query(
    `SELECT * FROM gas_connections WHERE id = $1 LIMIT 1`,
    [connectionId],
  );
  return result.rows[0] || null;
}

async function findDuplicateCustomer(mobile, addressLine) {
  const result = await query(
    `SELECT *
     FROM gas_customers
     WHERE mobile_number = $1
       AND lower(trim(address_line)) = lower(trim($2))
     LIMIT 1`,
    [String(mobile), String(addressLine)],
  );
  return result.rows[0] || null;
}

async function createBooking(input) {
  const bookingNumber = nextNumber("GAS-BOOK");
  const result = await query(
    `INSERT INTO gas_booking_orders (
      booking_number,
      customer_id,
      connection_id,
      cylinder_type,
      payment_mode,
      payment_status,
      booking_status,
      expected_delivery_date
    )
    VALUES ($1, $2, $3, $4, $5, 'pending', 'placed', $6)
    RETURNING *`,
    [
      bookingNumber,
      input.customer_id,
      input.connection_id,
      input.cylinder_type,
      input.payment_mode,
      input.expected_delivery_date || null,
    ],
  );

  return result.rows[0];
}

async function findBookingById(bookingId) {
  const result = await query(
    `SELECT * FROM gas_booking_orders WHERE id = $1 LIMIT 1`,
    [bookingId],
  );
  return result.rows[0] || null;
}

async function updateBookingStatus(bookingId, bookingStatus) {
  const isDelivered = bookingStatus === "delivered";
  const isCancelled = bookingStatus === "cancelled";

  const result = await query(
    `UPDATE gas_booking_orders
     SET
       booking_status = $2,
       payment_status = CASE
         WHEN $3 THEN 'paid'::gas_payment_status
         WHEN $4 THEN 'refunded'::gas_payment_status
         ELSE payment_status
       END,
       delivered_at = CASE WHEN $3 THEN NOW() ELSE delivered_at END,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [bookingId, bookingStatus, isDelivered, isCancelled],
  );

  return result.rows[0] || null;
}

async function listBookings(filters) {
  const clauses = [];
  const params = [];

  if (filters.customer_id) {
    params.push(filters.customer_id);
    clauses.push(`customer_id = $${params.length}`);
  }
  if (filters.booking_status) {
    params.push(filters.booking_status);
    clauses.push(`booking_status = $${params.length}`);
  }
  if (filters.payment_status) {
    params.push(filters.payment_status);
    clauses.push(`payment_status = $${params.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `SELECT * FROM gas_booking_orders ${where} ORDER BY created_at DESC`,
    params,
  );
  return result.rows;
}

async function createComplaint(input) {
  const complaintNumber = nextNumber("GAS-CMP");
  const result = await query(
    `INSERT INTO gas_complaints (
      complaint_number,
      customer_id,
      booking_id,
      complaint_type,
      severity,
      description,
      status,
      sla_due_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'open', $7)
    RETURNING *`,
    [
      complaintNumber,
      input.customer_id,
      input.booking_id || null,
      input.complaint_type,
      input.severity,
      input.description,
      input.sla_due_at,
    ],
  );

  return result.rows[0];
}

async function findComplaintById(complaintId) {
  const result = await query(
    `SELECT * FROM gas_complaints WHERE id = $1 LIMIT 1`,
    [complaintId],
  );
  return result.rows[0] || null;
}

async function updateComplaintStatus(complaintId, status) {
  const resolvedAt = status === "resolved" || status === "closed";
  const result = await query(
    `UPDATE gas_complaints
     SET
       status = $2,
       resolved_at = CASE WHEN $3 THEN NOW() ELSE resolved_at END,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [complaintId, status, resolvedAt],
  );

  return result.rows[0] || null;
}

async function addEvent(event) {
  const payload = JSON.stringify(event.payload_json || {});
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const logResult = await client.query(
      `INSERT INTO gas_event_log (
        entity_type,
        entity_id,
        event_type,
        auth_user_id,
        payload_json
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING *`,
      [
        event.entity_type,
        event.entity_id,
        event.event_type,
        event.auth_user_id || null,
        payload,
      ],
    );

    await client.query(
      `INSERT INTO gas_outbox_events (
        aggregate_type,
        aggregate_id,
        event_type,
        payload_json,
        status,
        retry_count
      )
      VALUES ($1, $2, $3, $4::jsonb, 'pending', 0)`,
      [event.entity_type, event.entity_id, event.event_type, payload],
    );

    await client.query("COMMIT");
    return logResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getDashboardMetrics() {
  const [customers, connections, bookings, complaints, events] =
    await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM gas_customers`),
      query(`SELECT COUNT(*)::int AS count FROM gas_connections`),
      query(`SELECT COUNT(*)::int AS count FROM gas_booking_orders`),
      query(`SELECT COUNT(*)::int AS count FROM gas_complaints`),
      query(`SELECT COUNT(*)::int AS count FROM gas_event_log`),
    ]);

  const [bookingGrouped, complaintGrouped] = await Promise.all([
    query(
      `SELECT booking_status::text AS status, COUNT(*)::int AS count
       FROM gas_booking_orders
       GROUP BY booking_status`,
    ),
    query(
      `SELECT status::text AS status, COUNT(*)::int AS count
       FROM gas_complaints
       GROUP BY status`,
    ),
  ]);

  const bookingsByStatus = {
    placed: 0,
    confirmed: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const row of bookingGrouped.rows) {
    bookingsByStatus[row.status] = row.count;
  }

  const complaintsByStatus = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    escalated: 0,
    closed: 0,
  };
  for (const row of complaintGrouped.rows) {
    complaintsByStatus[row.status] = row.count;
  }

  return {
    total_customers: customers.rows[0].count,
    total_connections: connections.rows[0].count,
    total_bookings: bookings.rows[0].count,
    bookings_by_status: bookingsByStatus,
    total_complaints: complaints.rows[0].count,
    complaints_by_status: complaintsByStatus,
    total_events: events.rows[0].count,
  };
}

module.exports = {
  createCustomer,
  createConnection,
  listDistributors,
  findCustomerById,
  findConnectionById,
  findDuplicateCustomer,
  createBooking,
  findBookingById,
  updateBookingStatus,
  listBookings,
  createComplaint,
  findComplaintById,
  updateComplaintStatus,
  addEvent,
  getDashboardMetrics,
};
