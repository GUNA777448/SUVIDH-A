const express = require("express");
const { registerGatewayRoutes } = require("./routes/gatewayRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4010;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Gateway is running!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, service: "api-gateway" });
});

registerGatewayRoutes(app);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
