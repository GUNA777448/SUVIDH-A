const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Electricity Service is running!");
});

app.listen(PORT, () => {
  console.log(`Electricity Service listening on port ${PORT}`);
});
