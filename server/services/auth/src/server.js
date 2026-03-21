require("dotenv").config();

const app = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`Auth service listening on port ${port}`);
});
