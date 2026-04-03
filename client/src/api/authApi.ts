import { API_BASE_URL, AUTH_API_PREFIX } from "../config/env";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

type ApiErrorEnvelope = {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type RequestOtpInput = {
  identifier: "mobile";
  value: string;
};

type VerifyOtpInput = RequestOtpInput & {
  otp: string;
};

export type RequestOtpResponse = {
  message: string;
  identifier: "mobile";
  value: string;
  email: string;
  ttlSeconds: number;
};

export type VerifyOtpResponse = {
  message: string;
  identifier: "mobile";
  value: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    gmail: string;
    aadharnumber: string;
    consumer_id: string;
    created_at: string;
  };
};

export type ProfileResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    gmail: string;
    aadharnumber: string;
    consumer_id: string;
    created_at: string;
  };
};

export class AuthApiError extends Error {
  code: string;

  constructor(message: string, code = "API_ERROR") {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
  }
}

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${AUTH_API_PREFIX}${path}`;
}

async function postJson<TResponse>(
  path: string,
  payload: Record<string, unknown>,
): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  const parsedBody = bodyText ? JSON.parse(bodyText) : null;

  if (!response.ok) {
    const errorBody = parsedBody as ApiErrorEnvelope | null;
    const errorMessage =
      errorBody?.error?.message ||
      `Request failed with status ${response.status}`;
    const errorCode = errorBody?.error?.code || "API_ERROR";
    throw new AuthApiError(errorMessage, errorCode);
  }

  const envelope = parsedBody as ApiEnvelope<TResponse> | null;
  if (!envelope?.success || !envelope.data) {
    throw new AuthApiError("Unexpected API response", "INVALID_RESPONSE");
  }

  return envelope.data;
}

async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const bodyText = await response.text();
  const parsedBody = bodyText ? JSON.parse(bodyText) : null;

  if (!response.ok) {
    const errorBody = parsedBody as ApiErrorEnvelope | null;
    const errorMessage =
      errorBody?.error?.message ||
      `Request failed with status ${response.status}`;
    const errorCode = errorBody?.error?.code || "API_ERROR";
    throw new AuthApiError(errorMessage, errorCode);
  }

  const envelope = parsedBody as ApiEnvelope<TResponse> | null;
  if (!envelope?.success || !envelope.data) {
    throw new AuthApiError("Unexpected API response", "INVALID_RESPONSE");
  }

  return envelope.data;
}

export function requestOtp(payload: RequestOtpInput) {
  return postJson<RequestOtpResponse>("/request/otp", payload);
}

export function verifyOtp(payload: VerifyOtpInput) {
  return postJson<VerifyOtpResponse>("/verify/otp", payload);
}

export function getProfile(mobile: string) {
  return getJson<ProfileResponse>(`/profile/${encodeURIComponent(mobile)}`);
}
