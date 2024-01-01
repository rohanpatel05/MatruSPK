const express = require("express");
const orderItemController = require("../controllers/orderItemController");
const router = express.Router();
const userAuthMiddleware = require("../middlewares/userAuthMiddleware.js");

router.get(
  "/orderitems/:orderId",
  userAuthMiddleware,
  orderItemController.getOrderItems
);

module.exports = router;
