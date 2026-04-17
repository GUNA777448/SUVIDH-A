const express = require("express");
const {
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntent,
} = require("../controllers/paymentController");

const paymentRouter = express.Router();

paymentRouter.post("/intents", createPaymentIntent);
paymentRouter.post("/:id/confirm", confirmPaymentIntent);
paymentRouter.get("/:id", getPaymentIntent);

module.exports = { paymentRouter };
