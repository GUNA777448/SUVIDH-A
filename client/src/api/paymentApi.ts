import { API_BASE_URL, PAYMENT_API_PREFIX } from "../config/env";

const PAYMENT_HISTORY_STORAGE_KEY = "suvidha.payment.history.v1";
const LEGACY_INTENTS_STORAGE_KEY = "suvidha.payment.intents.v1";
const LEGACY_TRANSACTIONS_STORAGE_KEY = "suvidha.payment.transactions.v1";
const PAYMENT_UPDATED_EVENT = "suvidha:payments-updated";

export type PaymentMethod = "upi" | "credit_card";

export type PaymentIntent = {
  payment_intent_id: string;
  intent_number: string;
  status: string;
  provider_session_token: string;
  expires_at: string;
};

export type PaymentCapture = {
  payment_intent_id: string;
  intent_number: string;
  transaction_id: string;
  provider_reference: string;
  payment_method: PaymentMethod;
  status: string;
  captured_at: string;
};

export type PaymentHistoryItem = {
  payment_intent_id: string;
  intent_number: string;
  transaction_id: string;
  provider_reference: string;
  payment_method: "upi" | "credit_card";
  status: string;
  captured_at: string;
  amount_minor: number;
  currency: string;
  domain_service: string;
  domain_reference_id: string;
  auth_user_id: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  duplicate?: boolean;
  data: T;
};

type ApiErrorEnvelope = {
  success: false;
  message?: string;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type LegacyStoredPaymentIntent = {
  payment_intent_id: string;
  intent_number: string;
  status: string;
  provider_session_token: string;
  expires_at: string;
  idempotency_key: string;
  domain_service: string;
  domain_reference_id: string;
  amount_minor: number;
  currency: string;
  auth_user_id: string;
  created_at: string;
  captured_at?: string;
  last_transaction_id?: string;
};

type LegacyStoredPaymentTransaction = {
  transaction_id: string;
  payment_intent_id: string;
  provider_reference: string;
  payment_method: PaymentMethod;
  status: string;
  captured_at: string;
};

export class PaymentApiError extends Error {
  code: string;

  constructor(message: string, code = "PAYMENT_API_ERROR") {
    super(message);
    this.name = "PaymentApiError";
    this.code = code;
  }
}

function assertStorageAvailable() {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new PaymentApiError(
      "Local payment storage is unavailable in this environment.",
      "PAYMENT_STORAGE_UNAVAILABLE",
    );
  }
}

function readStorage<T>(key: string, fallback: T): T {
  assertStorageAvailable();
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  assertStorageAvailable();
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifyPaymentUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(PAYMENT_UPDATED_EVENT));
}

function parseJsonSafely(bodyText: string) {
  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return null;
  }
}

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${PAYMENT_API_PREFIX}${path}`;
}

function handleResponse<T>(response: Response): Promise<T> {
  return response.text().then((bodyText) => {
    const parsedBody = parseJsonSafely(bodyText) as
      | ApiEnvelope<T>
      | ApiErrorEnvelope
      | null;
    const errorBody = parsedBody as ApiErrorEnvelope | null;

    if (!response.ok) {
      const message =
        errorBody?.message ||
        errorBody?.error?.message ||
        (bodyText && bodyText.slice(0, 180)) ||
        `Request failed with status ${response.status}`;
      throw new PaymentApiError(
        message,
        errorBody?.error?.code || "PAYMENT_API_ERROR",
      );
    }

    if (!parsedBody || !parsedBody.success || !("data" in parsedBody)) {
      throw new PaymentApiError(
        "Unexpected payment API response",
        "INVALID_RESPONSE",
      );
    }

    return parsedBody.data;
  });
}

function getStoredHistory() {
  return readStorage<PaymentHistoryItem[]>(PAYMENT_HISTORY_STORAGE_KEY, []);
}

function setStoredHistory(history: PaymentHistoryItem[]) {
  writeStorage(PAYMENT_HISTORY_STORAGE_KEY, history);
  notifyPaymentUpdated();
}

function hydrateFromLegacyStorage() {
  const intents = readStorage<LegacyStoredPaymentIntent[]>(
    LEGACY_INTENTS_STORAGE_KEY,
    [],
  );
  const transactions = readStorage<LegacyStoredPaymentTransaction[]>(
    LEGACY_TRANSACTIONS_STORAGE_KEY,
    [],
  );

  if (intents.length === 0 || transactions.length === 0) {
    return [];
  }

  const intentById = new Map(
    intents.map((intent) => [intent.payment_intent_id, intent]),
  );

  return transactions
    .map((transaction) => {
      const intent = intentById.get(transaction.payment_intent_id);
      if (!intent) {
        return null;
      }

      return {
        payment_intent_id: intent.payment_intent_id,
        intent_number: intent.intent_number,
        transaction_id: transaction.transaction_id,
        provider_reference: transaction.provider_reference,
        payment_method: transaction.payment_method,
        status: transaction.status,
        captured_at: transaction.captured_at,
        amount_minor: intent.amount_minor,
        currency: intent.currency,
        domain_service: intent.domain_service,
        domain_reference_id: intent.domain_reference_id,
        auth_user_id: intent.auth_user_id,
      } satisfies PaymentHistoryItem;
    })
    .filter((item): item is PaymentHistoryItem => Boolean(item))
    .sort(
      (a, b) =>
        new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
    );
}

export function subscribePaymentHistory(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      !event.key ||
      event.key === PAYMENT_HISTORY_STORAGE_KEY ||
      event.key === LEGACY_INTENTS_STORAGE_KEY ||
      event.key === LEGACY_TRANSACTIONS_STORAGE_KEY
    ) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PAYMENT_UPDATED_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PAYMENT_UPDATED_EVENT, onChange);
  };
}

export function listPaymentHistory(authUserId?: string): PaymentHistoryItem[] {
  const storedHistory = getStoredHistory();
  const legacyHistory =
    storedHistory.length > 0 ? [] : hydrateFromLegacyStorage();

  return [...storedHistory, ...legacyHistory]
    .filter((item) => !authUserId || item.auth_user_id === authUserId)
    .sort(
      (a, b) =>
        new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime(),
    );
}

export function recordPaymentHistory(entry: PaymentHistoryItem) {
  const history = getStoredHistory();
  const nextHistory = [
    entry,
    ...history.filter((item) => item.transaction_id !== entry.transaction_id),
  ];

  setStoredHistory(nextHistory);
}

export function clearPaymentHistory() {
  setStoredHistory([]);
}

export async function createPaymentIntent(params: {
  idempotencyKey: string;
  domainService: string;
  domainReferenceId: string;
  amountMinor: number;
  currency: string;
  authUserId: string;
}) {
  let response: Response;
  try {
    response = await fetch(buildUrl("/intents"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": params.idempotencyKey,
      },
      body: JSON.stringify({
        domain_service: params.domainService,
        domain_reference_id: params.domainReferenceId,
        amount_minor: params.amountMinor,
        currency: params.currency,
        auth_user_id: params.authUserId,
      }),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new PaymentApiError(
        "Payment service is unreachable. Start payment service on http://localhost:4005.",
        "PAYMENT_SERVICE_UNREACHABLE",
      );
    }

    throw error;
  }

  return handleResponse<PaymentIntent>(response);
}

export async function confirmPaymentIntent(params: {
  paymentIntentId: string;
  authUserId: string;
  paymentMethod: PaymentMethod;
  pin: string;
}) {
  let response: Response;
  try {
    response = await fetch(
      buildUrl(`/${encodeURIComponent(params.paymentIntentId)}/confirm`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_user_id: params.authUserId,
          payment_method: params.paymentMethod,
          pin: params.pin,
        }),
      },
    );
  } catch (error) {
    if (error instanceof TypeError) {
      throw new PaymentApiError(
        "Payment service is unreachable. Start payment service on http://localhost:4005.",
        "PAYMENT_SERVICE_UNREACHABLE",
      );
    }

    throw error;
  }

  return handleResponse<PaymentCapture>(response);
}
