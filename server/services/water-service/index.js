const express = require("express");
const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Water Service is running!");
});

app.listen(PORT, () => {
  console.log(`Water Service listening on port ${PORT}`);
});
