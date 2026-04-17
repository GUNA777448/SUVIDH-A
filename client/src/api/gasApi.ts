import { API_BASE_URL, GAS_API_PREFIX } from "../config/env";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
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

export type GasOverview = {
  service: string;
  scope: string;
  message: string;
  capabilities: string[];
};

export type GasDistributor = {
  id: string;
  distributor_code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  service_quality_score: number;
  is_active: boolean;
};

export type GasCustomer = {
  id: string;
  auth_user_id: string;
  customer_number: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  address_line: string;
  pincode: string;
  state: string;
  subsidy_opt_in: boolean;
  created_at: string;
};

export type GasConnection = {
  id: string;
  customer_id: string;
  connection_type: "domestic" | "commercial";
  connection_status: string;
  kyc_status: string;
  created_at: string;
};

export type CreateCustomerResponse = {
  customer: GasCustomer;
  connection: GasConnection;
};

export type GasBooking = {
  id: string;
  booking_number: string;
  customer_id: string;
  connection_id: string;
  cylinder_type: string;
  payment_mode: string;
  payment_status: string;
  booking_status: string;
  expected_delivery_date: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type GasComplaint = {
  id: string;
  complaint_number: string;
  customer_id: string;
  booking_id: string | null;
  complaint_type: string;
  severity: "low" | "medium" | "high" | "emergency";
  description: string;
  status: string;
  sla_due_at: string | null;
  created_at: string;
};

export type GasMetrics = {
  total_customers: number;
  total_connections: number;
  total_bookings: number;
  bookings_by_status: Record<string, number>;
  total_complaints: number;
  complaints_by_status: Record<string, number>;
  total_events: number;
};

export class GasApiError extends Error {
  code: string;

  constructor(message: string, code = "API_ERROR") {
    super(message);
    this.name = "GasApiError";
    this.code = code;
  }
}

function buildUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, "")}${GAS_API_PREFIX}${path}`;
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

async function handleResponse<T>(response: Response): Promise<T> {
  const bodyText = await response.text();
  const parsedBody = parseJsonSafely(bodyText);

  if (!response.ok) {
    const errorBody = parsedBody as ApiErrorEnvelope | null;
    const errorMessage =
      errorBody?.error?.message ||
      (bodyText && bodyText.slice(0, 120)) ||
      `Request failed with status ${response.status}`;
    const errorCode = errorBody?.error?.code || "API_ERROR";
    throw new GasApiError(errorMessage, errorCode);
  }

  const envelope = parsedBody as ApiEnvelope<T> | null;
  if (!envelope?.success || envelope.data === undefined) {
    throw new GasApiError("Unexpected API response", "INVALID_RESPONSE");
  }

  return envelope.data;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

async function postJson<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

async function patchJson<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export function getGasOverview() {
  return getJson<GasOverview>("/overview");
}

export function getGasDistributors(params?: {
  state?: string;
  pincode?: string;
  is_active?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.state) query.set("state", params.state);
  if (params?.pincode) query.set("pincode", params.pincode);
  if (params?.is_active !== undefined) {
    query.set("is_active", String(params.is_active));
  }

  const suffix = query.toString()
    ? `/distributors?${query.toString()}`
    : "/distributors";
  return getJson<GasDistributor[]>(suffix);
}

export function createGasCustomer(payload: {
  auth_user_id: string;
  full_name: string;
  mobile_number: string;
  address_line: string;
  pincode: string;
  state: string;
  connection_type?: "domestic" | "commercial";
  distributor_code?: string;
  email?: string;
  subsidy_opt_in?: boolean;
}) {
  return postJson<CreateCustomerResponse>("/customers", payload);
}

export function getGasCustomer(customerId: string) {
  return getJson<GasCustomer>(`/customers/${encodeURIComponent(customerId)}`);
}

export function createGasBooking(payload: {
  customer_id: string;
  connection_id: string;
  cylinder_type: "14_2kg" | "5kg" | "19kg";
  payment_mode: "upi" | "card" | "cash_on_delivery" | "wallet";
  expected_delivery_date?: string;
}) {
  return postJson<GasBooking>("/bookings", payload);
}

export function listGasBookings(filters?: {
  customer_id?: string;
  booking_status?: string;
  payment_status?: string;
}) {
  const query = new URLSearchParams();
  if (filters?.customer_id) query.set("customer_id", filters.customer_id);
  if (filters?.booking_status)
    query.set("booking_status", filters.booking_status);
  if (filters?.payment_status)
    query.set("payment_status", filters.payment_status);

  const suffix = query.toString()
    ? `/bookings?${query.toString()}`
    : "/bookings";
  return getJson<GasBooking[]>(suffix);
}

export function updateGasBookingStatus(
  bookingId: string,
  booking_status: string,
) {
  return patchJson<GasBooking>(
    `/bookings/${encodeURIComponent(bookingId)}/status`,
    {
      booking_status,
    },
  );
}

export function createGasComplaint(payload: {
  customer_id: string;
  booking_id?: string;
  complaint_type:
    | "leakage"
    | "delayed_delivery"
    | "overcharge"
    | "subsidy_issue"
    | "behavior_issue"
    | "other";
  severity: "low" | "medium" | "high" | "emergency";
  description: string;
}) {
  return postJson<GasComplaint>("/complaints", payload);
}

export function updateGasComplaintStatus(complaintId: string, status: string) {
  return patchJson<GasComplaint>(
    `/complaints/${encodeURIComponent(complaintId)}/status`,
    {
      status,
    },
  );
}

export function getGasMetrics() {
  return getJson<GasMetrics>("/dashboard/metrics");
}
