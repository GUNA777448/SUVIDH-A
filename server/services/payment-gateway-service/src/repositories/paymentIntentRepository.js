const crypto = require("crypto");

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function buildPayloadHash(payload) {
  return crypto
    .createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex");
}

async function findByIdempotencyKey(client, idempotencyKey) {
  const result = await client.query(
    `
      SELECT
        id,
        intent_number,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at,
        payload_hash,
        created_at,
        updated_at
      FROM payment_intents
      WHERE idempotency_key = $1
      FOR UPDATE
    `,
    [idempotencyKey],
  );

  return result.rows[0] || null;
}

async function createIntentWithOutbox(client, data) {
  const intentResult = await client.query(
    `
      INSERT INTO payment_intents (
        id,
        intent_number,
        idempotency_key,
        payload_hash,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        'created',
        $9,
        NOW() + INTERVAL '15 minutes'
      )
      RETURNING
        id,
        intent_number,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at,
        created_at,
        updated_at
    `,
    [
      data.intentNumber,
      data.idempotencyKey,
      data.payloadHash,
      data.authUserId,
      data.domainService,
      data.domainReferenceId,
      data.amountMinor,
      data.currency,
      data.providerSessionToken,
    ],
  );

  const intent = intentResult.rows[0];

  await client.query(
    `
      INSERT INTO payment_outbox_events (
        id,
        aggregate_type,
        aggregate_id,
        event_type,
        payload_json,
        status,
        retry_count
      )
      VALUES (
        gen_random_uuid(),
        'payment_intent',
        $1,
        'payment.intent.created',
        $2::jsonb,
        'pending',
        0
      )
    `,
    [
      intent.id,
      JSON.stringify({
        payment_intent_id: intent.id,
        intent_number: intent.intent_number,
        auth_user_id: intent.auth_user_id,
        domain_service: intent.domain_service,
        domain_reference_id: intent.domain_reference_id,
        amount_minor: intent.amount_minor,
        currency: intent.currency,
        status: intent.status,
        occurred_at: new Date().toISOString(),
      }),
    ],
  );

  return intent;
}

async function findIntentById(client, intentId) {
  const result = await client.query(
    `
      SELECT
        id,
        intent_number,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at,
        created_at,
        updated_at
      FROM payment_intents
      WHERE id = $1
      FOR UPDATE
    `,
    [intentId],
  );

  return result.rows[0] || null;
}

async function findIntentByIdReadOnly(client, intentId) {
  const result = await client.query(
    `
      SELECT
        id,
        intent_number,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at,
        created_at,
        updated_at
      FROM payment_intents
      WHERE id = $1
    `,
    [intentId],
  );

  return result.rows[0] || null;
}

async function getLatestTransactionByIntentId(client, intentId) {
  const result = await client.query(
    `
      SELECT
        id,
        intent_id,
        provider_name,
        provider_reference,
        payment_method,
        status,
        authorized_at,
        captured_at,
        failed_at,
        failure_code,
        failure_reason,
        created_at,
        updated_at
      FROM payment_transactions
      WHERE intent_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [intentId],
  );

  return result.rows[0] || null;
}

async function confirmIntentWithOutbox(client, data) {
  const lockedIntent = await findIntentById(client, data.intentId);
  if (!lockedIntent) {
    return null;
  }

  const existingTransaction = await getLatestTransactionByIntentId(
    client,
    data.intentId,
  );

  if (lockedIntent.status === "captured" && existingTransaction) {
    return {
      intent: lockedIntent,
      transaction: existingTransaction,
      alreadyCaptured: true,
    };
  }

  const transactionResult = await client.query(
    `
      INSERT INTO payment_transactions (
        id,
        intent_id,
        provider_name,
        provider_reference,
        payment_method,
        status,
        authorized_at,
        captured_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        'captured',
        NOW(),
        NOW(),
        NOW()
      )
      RETURNING
        id,
        intent_id,
        provider_name,
        provider_reference,
        payment_method,
        status,
        authorized_at,
        captured_at,
        failed_at,
        failure_code,
        failure_reason,
        created_at,
        updated_at
    `,
    [
      lockedIntent.id,
      data.providerName,
      data.providerReference,
      data.paymentMethod,
    ],
  );

  const intentResult = await client.query(
    `
      UPDATE payment_intents
      SET status = 'captured',
          updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        intent_number,
        auth_user_id,
        domain_service,
        domain_reference_id,
        amount_minor,
        currency,
        status,
        provider_session_token,
        expires_at,
        created_at,
        updated_at
    `,
    [lockedIntent.id],
  );

  const updatedIntent = intentResult.rows[0];
  const transaction = transactionResult.rows[0];

  await client.query(
    `
      INSERT INTO payment_outbox_events (
        id,
        aggregate_type,
        aggregate_id,
        event_type,
        payload_json,
        status,
        retry_count
      )
      VALUES (
        gen_random_uuid(),
        'payment_intent',
        $1,
        'payment.captured',
        $2::jsonb,
        'pending',
        0
      )
    `,
    [
      updatedIntent.id,
      JSON.stringify({
        payment_intent_id: updatedIntent.id,
        intent_number: updatedIntent.intent_number,
        transaction_id: transaction.id,
        payment_method: transaction.payment_method,
        provider_reference: transaction.provider_reference,
        amount_minor: updatedIntent.amount_minor,
        currency: updatedIntent.currency,
        status: updatedIntent.status,
        occurred_at: new Date().toISOString(),
      }),
    ],
  );

  return {
    intent: updatedIntent,
    transaction,
    alreadyCaptured: false,
  };
}

module.exports = {
  buildPayloadHash,
  findByIdempotencyKey,
  createIntentWithOutbox,
  findIntentByIdReadOnly,
  confirmIntentWithOutbox,
};
