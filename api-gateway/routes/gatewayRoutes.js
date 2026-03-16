const { createProxyMiddleware } = require("http-proxy-middleware");
const { SERVICE_URLS } = require("../config/services");

const serviceRoutes = [
  { path: "/electricity", target: SERVICE_URLS.electricity },
  { path: "/gas", target: SERVICE_URLS.gas },
  { path: "/water", target: SERVICE_URLS.water },
  { path: "/waste", target: SERVICE_URLS.waste },
  { path: "/payments", target: SERVICE_URLS.payment },
  { path: "/grievance", target: SERVICE_URLS.grievance },
  { path: "/documents", target: SERVICE_URLS.document },
  { path: "/notifications", target: SERVICE_URLS.notification },
  { path: "/auth", target: SERVICE_URLS.auth },
];

function registerGatewayRoutes(app) {
  serviceRoutes.forEach(({ path, target }) => {
    app.use(
      path,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${path}`]: "" },
      }),
    );
  });
}

module.exports = { registerGatewayRoutes };
