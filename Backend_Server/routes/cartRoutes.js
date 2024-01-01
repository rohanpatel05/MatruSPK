const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController.js");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware.js");

let baseCartUrl = "/cart";
router.delete(
  baseCartUrl + "/:cartID",
  userAuthMiddleware,
  cartController.clearCart
);

module.exports = router;
