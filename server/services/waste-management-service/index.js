const express = require("express");
const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Waste Management Service is running!");
});

app.listen(PORT, () => {
  console.log(`Waste Management Service listening on port ${PORT}`);
});
