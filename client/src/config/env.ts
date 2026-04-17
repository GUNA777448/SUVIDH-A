const DEFAULT_API_BASE_URL = "";
const DEFAULT_AUTH_API_PREFIX = "/api/v1/auth";
const DEFAULT_GAS_API_PREFIX = "/api/v1/gas-distribution";
const DEFAULT_PAYMENT_API_PREFIX = "/api/v1/payments";
const DEFAULT_AUTH_SERVICE_URL = "http://localhost:4009";
const DEFAULT_ELECTRICITY_SERVICE_URL = "http://localhost:4001";
const DEFAULT_GAS_SERVICE_URL = "http://localhost:4002";
const DEFAULT_WATER_SERVICE_URL = "http://localhost:4003";
const DEFAULT_WASTE_SERVICE_URL = "http://localhost:4004";
const DEFAULT_PAYMENT_SERVICE_URL = "http://localhost:4005";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export const AUTH_API_PREFIX =
  import.meta.env.VITE_AUTH_API_PREFIX?.trim() || DEFAULT_AUTH_API_PREFIX;

export const GAS_API_PREFIX =
  import.meta.env.VITE_GAS_API_PREFIX?.trim() || DEFAULT_GAS_API_PREFIX;

export const PAYMENT_API_PREFIX =
  import.meta.env.VITE_PAYMENT_API_PREFIX?.trim() || DEFAULT_PAYMENT_API_PREFIX;

export const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL?.trim() || DEFAULT_AUTH_SERVICE_URL;

export const ELECTRICITY_SERVICE_URL =
  import.meta.env.VITE_ELECTRICITY_SERVICE_URL?.trim() ||
  DEFAULT_ELECTRICITY_SERVICE_URL;

export const GAS_SERVICE_URL =
  import.meta.env.VITE_GAS_SERVICE_URL?.trim() || DEFAULT_GAS_SERVICE_URL;

export const WATER_SERVICE_URL =
  import.meta.env.VITE_WATER_SERVICE_URL?.trim() || DEFAULT_WATER_SERVICE_URL;

export const WASTE_SERVICE_URL =
  import.meta.env.VITE_WASTE_SERVICE_URL?.trim() || DEFAULT_WASTE_SERVICE_URL;

export const PAYMENT_SERVICE_URL =
  import.meta.env.VITE_PAYMENT_SERVICE_URL?.trim() ||
  DEFAULT_PAYMENT_SERVICE_URL;
