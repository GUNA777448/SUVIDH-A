const crypto = require("crypto");

const HARD_CODED_PAYMENT_PIN = "1234";
const intentsById = new Map();
const intentsByIdempotencyKey = new Map();

function createIntentNumber() {
  const timestamp = Date.now();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PI-${timestamp}-${suffix}`;
}

function createProviderSessionToken() {
  return crypto.randomBytes(16).toString("hex");
}

function createProviderReference() {
  const timestamp = Date.now();
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PG-${timestamp}-${suffix}`;
}

function buildPayloadHash(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function getRequiredString(body, field) {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

async function createPaymentIntent(req, res, next) {
  try {
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey || idempotencyKey.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Idempotency-Key header is required",
      });
    }

    const domainService = getRequiredString(req.body, "domain_service");
    const domainReferenceId = getRequiredString(
      req.body,
      "domain_reference_id",
    );
    const authUserId = getRequiredString(req.body, "auth_user_id");
    const currency = (
      getRequiredString(req.body, "currency") || "INR"
    ).toUpperCase();

    const amountMinor = Number(req.body.amount_minor);
    if (!domainService || !domainReferenceId || !authUserId) {
      return res.status(400).json({
        success: false,
        message:
          "domain_service, domain_reference_id and auth_user_id are required",
      });
    }

    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount_minor must be a positive integer",
      });
    }

    const normalizedPayload = {
      domain_service: domainService,
      domain_reference_id: domainReferenceId,
      auth_user_id: authUserId,
      amount_minor: amountMinor,
      currency,
    };

    const payloadHash = buildPayloadHash(normalizedPayload);
    const normalizedIdempotencyKey = idempotencyKey.trim();
    const existingIntentId = intentsByIdempotencyKey.get(
      normalizedIdempotencyKey,
    );

    if (existingIntentId) {
      const existing = intentsById.get(existingIntentId);

      if (!existing) {
        intentsByIdempotencyKey.delete(normalizedIdempotencyKey);
      } else {
        if (existing.payload_hash !== payloadHash) {
          return res.status(409).json({
            success: false,
            message: "Idempotency key already used with a different payload",
          });
        }

        return res.status(200).json({
          success: true,
          duplicate: true,
          data: {
            payment_intent_id: existing.id,
            intent_number: existing.intent_number,
            status: existing.status,
            provider_session_token: existing.provider_session_token,
            expires_at: existing.expires_at,
          },
        });
      }
    }

    const intentId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const created = {
      id: intentId,
      intent_number: createIntentNumber(),
      idempotency_key: normalizedIdempotencyKey,
      payload_hash: payloadHash,
      auth_user_id: authUserId,
      domain_service: domainService,
      domain_reference_id: domainReferenceId,
      amount_minor: amountMinor,
      currency,
      provider_session_token: createProviderSessionToken(),
      status: "requires_confirmation",
      created_at: nowIso,
      updated_at: nowIso,
      expires_at: expiresAtIso,
      transaction: null,
    };

    intentsById.set(intentId, created);
    intentsByIdempotencyKey.set(normalizedIdempotencyKey, intentId);

    return res.status(200).json({
      success: true,
      duplicate: false,
      data: {
        payment_intent_id: created.id,
        intent_number: created.intent_number,
        status: created.status,
        provider_session_token: created.provider_session_token,
        expires_at: created.expires_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function confirmPaymentIntent(req, res, next) {
  try {
    const intentId = req.params.id;
    const authUserId = getRequiredString(req.body, "auth_user_id");
    const paymentMethod = getRequiredString(req.body, "payment_method");
    const pin = getRequiredString(req.body, "pin");
    const providerReference =
      getRequiredString(req.body, "provider_reference") ||
      createProviderReference();

    if (!authUserId || !paymentMethod || !pin) {
      return res.status(400).json({
        success: false,
        message: "auth_user_id, payment_method and pin are required",
      });
    }

    if (pin !== HARD_CODED_PAYMENT_PIN) {
      return res.status(401).json({
        success: false,
        message: "Invalid payment PIN",
      });
    }

    const normalizedMethod = paymentMethod.toLowerCase();
    if (
      !["upi", "credit_card", "debit_card", "netbanking"].includes(
        normalizedMethod,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "payment_method must be one of: upi, credit_card, debit_card, netbanking",
      });
    }

    const intent = intentsById.get(intentId);
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found",
      });
    }

    if (intent.auth_user_id !== authUserId) {
      return res.status(403).json({
        success: false,
        message: "auth_user_id does not match payment intent owner",
      });
    }

    const alreadyCaptured = intent.status === "captured" && intent.transaction;
    if (!alreadyCaptured) {
      intent.status = "captured";
      intent.updated_at = new Date().toISOString();
      intent.transaction = {
        id: crypto.randomUUID(),
        provider_reference: providerReference,
        payment_method: normalizedMethod,
        captured_at: new Date().toISOString(),
      };
    }

    return res.status(200).json({
      success: true,
      duplicate: Boolean(alreadyCaptured),
      data: {
        payment_intent_id: intent.id,
        intent_number: intent.intent_number,
        transaction_id: intent.transaction.id,
        provider_reference: intent.transaction.provider_reference,
        payment_method: intent.transaction.payment_method,
        status: intent.status,
        captured_at: intent.transaction.captured_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getPaymentIntent(req, res, next) {
  try {
    const intentId = req.params.id;

    const intent = intentsById.get(intentId);

    if (!intent) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        payment_intent_id: intent.id,
        intent_number: intent.intent_number,
        status: intent.status,
        amount_minor: intent.amount_minor,
        currency: intent.currency,
        domain_service: intent.domain_service,
        domain_reference_id: intent.domain_reference_id,
        created_at: intent.created_at,
        updated_at: intent.updated_at,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntent,
};
