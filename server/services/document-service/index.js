const express = require("express");
const app = express();
const PORT = process.env.PORT || 4007;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Document Service is running!");
});

app.listen(PORT, () => {
  console.log(`Document Service listening on port ${PORT}`);
});
