const express = require("express");
const app = express();
const PORT = process.env.PORT || 4006;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Grievance Service is running!");
});

app.listen(PORT, () => {
  console.log(`Grievance Service listening on port ${PORT}`);
});
