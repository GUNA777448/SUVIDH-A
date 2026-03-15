const express = require("express");
const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Gas Distribution Service is running!");
});

app.listen(PORT, () => {
  console.log(`Gas Distribution Service listening on port ${PORT}`);
});
