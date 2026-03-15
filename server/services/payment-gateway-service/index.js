const express = require("express");
const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Payment Gateway Service is running!");
});

app.listen(PORT, () => {
  console.log(`Payment Gateway Service listening on port ${PORT}`);
});
