// Basic Express server setup for Node.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// TODO: Import routes, middleware, etc. from /routes, /middleware, etc.

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
