const express = require("express");
const paymentController = require("../controllers/paymentController");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");
const router = express.Router();

let basePaymentUrl = "/payments";
router.get(
  basePaymentUrl,
  adminAuthMiddleware,
  paymentController.getAllPayments
);
router.get(
  basePaymentUrl + "/:orderId",
  adminAuthMiddleware,
  paymentController.getPaymentByOrder
);
router.post(
  basePaymentUrl + "/intents",
  userAuthMiddleware,
  paymentController.createPaymentIntent
);

module.exports = router;
