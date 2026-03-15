const express = require("express");
const app = express();
const PORT = process.env.PORT || 4008;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Notification Service is running!");
});

app.listen(PORT, () => {
  console.log(`Notification Service listening on port ${PORT}`);
});
