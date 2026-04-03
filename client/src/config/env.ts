const DEFAULT_API_BASE_URL = "http://localhost:8000";
const DEFAULT_AUTH_API_PREFIX = "/api/v1/auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const AUTH_API_PREFIX =
  import.meta.env.VITE_AUTH_API_PREFIX?.trim() || DEFAULT_AUTH_API_PREFIX;
