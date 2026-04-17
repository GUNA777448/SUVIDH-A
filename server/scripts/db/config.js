const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const SERVICES_ROOT = path.join(REPO_ROOT, "server", "services");

const SERVICES = [
  { name: "auth", dir: "auth", envVar: "AUTH_DATABASE_URL" },
  {
    name: "electricity-service",
    dir: "electricity-service",
    envVar: "ELECTRICITY_SERVICE_DATABASE_URL",
  },
  {
    name: "gas-distribution-service",
    dir: "gas-distribution-service",
    envVar: "GAS_DISTRIBUTION_SERVICE_DATABASE_URL",
  },
  {
    name: "water-service",
    dir: "water-service",
    envVar: "WATER_SERVICE_DATABASE_URL",
  },
  {
    name: "waste-management-service",
    dir: "waste-management-service",
    envVar: "WASTE_MANAGEMENT_SERVICE_DATABASE_URL",
  },
  {
    name: "payment-gateway-service",
    dir: "payment-gateway-service",
    envVar: "PAYMENT_GATEWAY_SERVICE_DATABASE_URL",
  },
  {
    name: "grievance-service",
    dir: "grievance-service",
    envVar: "GRIEVANCE_SERVICE_DATABASE_URL",
  },
  {
    name: "document-service",
    dir: "document-service",
    envVar: "DOCUMENT_SERVICE_DATABASE_URL",
  },
  {
    name: "notification-service",
    dir: "notification-service",
    envVar: "NOTIFICATION_SERVICE_DATABASE_URL",
  },
];

function resolveServices(selectedNames) {
  if (!selectedNames || selectedNames.length === 0) {
    return SERVICES;
  }

  const requested = new Set(
    selectedNames.map((name) => name.trim()).filter(Boolean),
  );
  const matched = SERVICES.filter((service) => requested.has(service.name));

  if (matched.length !== requested.size) {
    const known = SERVICES.map((service) => service.name).join(", ");
    const unknown = [...requested].filter(
      (name) => !SERVICES.some((service) => service.name === name),
    );
    throw new Error(
      `Unknown service name(s): ${unknown.join(", ")}. Known services: ${known}`,
    );
  }

  return matched;
}

module.exports = {
  REPO_ROOT,
  SERVICES_ROOT,
  SERVICES,
  resolveServices,
};
