const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();
const adminStafAuthMiddleware = require("../middlewares/adminStaffAuthMiddleware.js");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

let baseOrderUrl = "/orders";
router.get(
  baseOrderUrl + "/orderAvailable/:cartID",
  userAuthMiddleware,
  orderController.proceedToPayment
);
router.get(
  baseOrderUrl + "/byUser/:userEmail",
  userAuthMiddleware,
  orderController.getUserOrders
);
router.get(
  baseOrderUrl + "/byStatus/:status",
  adminStafAuthMiddleware,
  orderController.getOrdersByStatus
);
router.post(baseOrderUrl, userAuthMiddleware, orderController.createOrder);
router.put(
  baseOrderUrl + "/updateStatus/:orderID",
  adminStafAuthMiddleware,
  orderController.updateOrderStatus
);

module.exports = router;
