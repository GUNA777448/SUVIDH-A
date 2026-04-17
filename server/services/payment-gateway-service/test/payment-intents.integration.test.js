const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const request = require("supertest");
const { Client } = require("pg");

const dbUrl =
  process.env.PAYMENT_GATEWAY_SERVICE_DATABASE_URL_TEST ||
  process.env.PAYMENT_GATEWAY_SERVICE_DATABASE_URL;

if (dbUrl) {
  process.env.PAYMENT_GATEWAY_SERVICE_DATABASE_URL = dbUrl;
}

let app;
let pool;
let dbClient;

function readMigrationFile(fileName) {
  const filePath = path.resolve(__dirname, "..", "migrations", fileName);
  return fs.readFileSync(filePath, "utf8");
}

async function applyPaymentMigrations(client) {
  const files = [
    "20260417090000_create_payment_intents.up.sql",
    "20260417090500_create_payment_transactions.up.sql",
  ];

  for (const file of files) {
    await client.query(readMigrationFile(file));
  }
}

async function dropFailureTrigger(client) {
  await client.query(
    "DROP TRIGGER IF EXISTS payment_outbox_fail_trigger ON payment_outbox_events;",
  );
  await client.query(
    "DROP FUNCTION IF EXISTS raise_payment_outbox_insert_failure();",
  );
}

async function cleanTables(client) {
  await client.query(
    "TRUNCATE TABLE payment_transactions, payment_outbox_events, payment_intents RESTART IDENTITY CASCADE;",
  );
}

test.before(async () => {
  if (!dbUrl) {
    return;
  }

  ({ app } = require("../src/app"));
  ({ pool } = require("../src/config/db"));

  dbClient = new Client({ connectionString: dbUrl });
  await dbClient.connect();
  await applyPaymentMigrations(dbClient);
});

test.beforeEach(async () => {
  if (!dbUrl) {
    return;
  }

  await dropFailureTrigger(dbClient);
  await cleanTables(dbClient);
});

test.after(async () => {
  if (!dbUrl) {
    return;
  }

  await dropFailureTrigger(dbClient);
  await dbClient.end();
  await pool.end();
});

test(
  "creates one intent and one outbox event for idempotent retries",
  { skip: !dbUrl },
  async () => {
    const idempotencyKey = "intent-idempotency-001";
    const payload = {
      domain_service: "electricity-service",
      domain_reference_id: "invoice-123",
      auth_user_id: "11111111-1111-1111-1111-111111111111",
      amount_minor: 19900,
      currency: "INR",
    };

    const firstResponse = await request(app)
      .post("/api/v1/payments/intents")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    assert.equal(firstResponse.statusCode, 201);
    assert.equal(firstResponse.body.success, true);
    assert.equal(firstResponse.body.duplicate, false);

    const secondResponse = await request(app)
      .post("/api/v1/payments/intents")
      .set("Idempotency-Key", idempotencyKey)
      .send(payload);

    assert.equal(secondResponse.statusCode, 200);
    assert.equal(secondResponse.body.success, true);
    assert.equal(secondResponse.body.duplicate, true);
    assert.equal(
      secondResponse.body.data.payment_intent_id,
      firstResponse.body.data.payment_intent_id,
    );

    const intentCountResult = await dbClient.query(
      "SELECT COUNT(*)::int AS count FROM payment_intents WHERE idempotency_key = $1;",
      [idempotencyKey],
    );
    assert.equal(intentCountResult.rows[0].count, 1);

    const outboxCountResult = await dbClient.query(
      "SELECT COUNT(*)::int AS count FROM payment_outbox_events WHERE aggregate_id = $1;",
      [firstResponse.body.data.payment_intent_id],
    );
    assert.equal(outboxCountResult.rows[0].count, 1);
  },
);

test(
  "rolls back payment intent when outbox insert fails",
  { skip: !dbUrl },
  async () => {
    await dbClient.query(`
    CREATE OR REPLACE FUNCTION raise_payment_outbox_insert_failure()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RAISE EXCEPTION 'forced outbox failure';
    END;
    $$;
  `);

    await dbClient.query(`
    CREATE TRIGGER payment_outbox_fail_trigger
    BEFORE INSERT ON payment_outbox_events
    FOR EACH ROW
    EXECUTE FUNCTION raise_payment_outbox_insert_failure();
  `);

    const failingKey = "intent-idempotency-rollback-001";
    const payload = {
      domain_service: "water-service",
      domain_reference_id: "invoice-987",
      auth_user_id: "22222222-2222-2222-2222-222222222222",
      amount_minor: 2500,
      currency: "INR",
    };

    const response = await request(app)
      .post("/api/v1/payments/intents")
      .set("Idempotency-Key", failingKey)
      .send(payload);

    assert.equal(response.statusCode, 500);
    assert.equal(response.body.success, false);

    const intentCountResult = await dbClient.query(
      "SELECT COUNT(*)::int AS count FROM payment_intents WHERE idempotency_key = $1;",
      [failingKey],
    );

    assert.equal(intentCountResult.rows[0].count, 0);
  },
);

test(
  "confirms payment intent and emits capture outbox event",
  { skip: !dbUrl },
  async () => {
    const createPayload = {
      domain_service: "water-service",
      domain_reference_id: "water-bill-2026-04",
      auth_user_id: "33333333-3333-3333-3333-333333333333",
      amount_minor: 185000,
      currency: "INR",
    };

    const createResponse = await request(app)
      .post("/api/v1/payments/intents")
      .set("Idempotency-Key", "confirm-intent-001")
      .send(createPayload);

    assert.equal(createResponse.statusCode, 201);
    assert.equal(createResponse.body.success, true);

    const confirmResponse = await request(app)
      .post(
        `/api/v1/payments/${createResponse.body.data.payment_intent_id}/confirm`,
      )
      .send({
        auth_user_id: createPayload.auth_user_id,
        payment_method: "upi",
        pin: "1234",
      });

    assert.equal(confirmResponse.statusCode, 200);
    assert.equal(confirmResponse.body.success, true);
    assert.equal(confirmResponse.body.data.status, "captured");
    assert.equal(confirmResponse.body.data.payment_method, "upi");

    const intentStatusResult = await dbClient.query(
      "SELECT status FROM payment_intents WHERE id = $1;",
      [createResponse.body.data.payment_intent_id],
    );
    assert.equal(intentStatusResult.rows[0].status, "captured");

    const transactionCountResult = await dbClient.query(
      "SELECT COUNT(*)::int AS count FROM payment_transactions WHERE intent_id = $1;",
      [createResponse.body.data.payment_intent_id],
    );
    assert.equal(transactionCountResult.rows[0].count, 1);

    const outboxEventsResult = await dbClient.query(
      "SELECT event_type FROM payment_outbox_events WHERE aggregate_id = $1 ORDER BY created_at ASC;",
      [createResponse.body.data.payment_intent_id],
    );

    const eventTypes = outboxEventsResult.rows.map((row) => row.event_type);
    assert.deepEqual(eventTypes, [
      "payment.intent.created",
      "payment.captured",
    ]);
  },
);

test(
  "rejects payment confirmation when pin is invalid",
  { skip: !dbUrl },
  async () => {
    const createPayload = {
      domain_service: "water-service",
      domain_reference_id: "water-bill-2026-04",
      auth_user_id: "44444444-4444-4444-4444-444444444444",
      amount_minor: 185000,
      currency: "INR",
    };

    const createResponse = await request(app)
      .post("/api/v1/payments/intents")
      .set("Idempotency-Key", "invalid-pin-intent-001")
      .send(createPayload);

    assert.equal(createResponse.statusCode, 201);

    const confirmResponse = await request(app)
      .post(
        `/api/v1/payments/${createResponse.body.data.payment_intent_id}/confirm`,
      )
      .send({
        auth_user_id: createPayload.auth_user_id,
        payment_method: "upi",
        pin: "0000",
      });

    assert.equal(confirmResponse.statusCode, 401);
    assert.equal(confirmResponse.body.success, false);
    assert.equal(confirmResponse.body.message, "Invalid payment PIN");
  },
);
