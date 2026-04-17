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

type RegisterInput = {
  name: string;
  email: string;
  mobile: string;
  aadhar?: string | null;
};

export type RequestOtpResponse = {
  message: string;
  mobile: string;
  otp_expiry_seconds: number;
};

export type VerifyOtpResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    aadhar: string | null;
    created_at: string;
    updated_at: string;
  };
};

export type ProfileResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    aadhar: string | null;
    created_at: string;
    updated_at: string;
  };
};

export type RegisterResponse = {
  user: {
    id: string;
    name: string;
    mobile: string;
    email: string;
    aadhar: string | null;
    created_at: string;
    updated_at: string;
  };
  created: boolean;
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
  const parsedBody = parseJsonSafely(bodyText);

  if (!response.ok) {
    const errorBody = parsedBody as ApiErrorEnvelope | null;
    const errorMessage =
      errorBody?.error?.message ||
      (bodyText && bodyText.slice(0, 120)) ||
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
  const parsedBody = parseJsonSafely(bodyText);

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
  return postJson<RequestOtpResponse>("/login", {
    identifier: "M",
    value: payload.value,
  });
}

export function registerUser(payload: RegisterInput) {
  return postJson<RegisterResponse>("/register", {
    name: payload.name,
    email: payload.email,
    mobile: payload.mobile,
    aadhar: payload.aadhar ?? null,
  });
}

export function verifyOtp(payload: VerifyOtpInput) {
  return postJson<VerifyOtpResponse>("/verify/otp", {
    mobile: payload.value,
    otp: payload.otp,
  });
}

export function getProfileByUserId(userId: string) {
  const encodedUserId = encodeURIComponent(userId);

  return getJson<ProfileResponse>(`/profile/userid=${encodedUserId}`).catch(
    (error: unknown) => {
      if (
        error instanceof AuthApiError &&
        error.message.includes("status 404")
      ) {
        return getJson<ProfileResponse>(`/profile/userid/${encodedUserId}`);
      }

      throw error;
    },
  );
}
