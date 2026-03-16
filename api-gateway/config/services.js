const SERVICE_URLS = {
  electricity: process.env.ELECTRICITY_SERVICE_URL || "http://localhost:4001",
  gas: process.env.GAS_DISTRIBUTION_SERVICE_URL || "http://localhost:4002",
  water: process.env.WATER_SERVICE_URL || "http://localhost:4003",
  waste: process.env.WASTE_MANAGEMENT_SERVICE_URL || "http://localhost:4004",
  payment: process.env.PAYMENT_GATEWAY_SERVICE_URL || "http://localhost:4005",
  grievance: process.env.GRIEVANCE_SERVICE_URL || "http://localhost:4006",
  document: process.env.DOCUMENT_SERVICE_URL || "http://localhost:4007",
  notification: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4008",
  auth: process.env.AUTH_SERVICE_URL || "http://localhost:4009",
};

module.exports = { SERVICE_URLS };
