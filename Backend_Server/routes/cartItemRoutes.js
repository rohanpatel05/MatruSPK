const express = require("express");
const router = express.Router();
const cartItemController = require("../controllers/cartItemController.js");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware.js");

let baseCartItemUrl = "/cartitems";
router.get(baseCartItemUrl + "/:cartID", cartItemController.getCartItems);
router.post(
  baseCartItemUrl + "/:cartID",
  userAuthMiddleware,
  cartItemController.addItemToCart
);
router.put(
  baseCartItemUrl + "/increment/:cartItemID",
  userAuthMiddleware,
  cartItemController.incrementCartItemQTY
);
router.put(
  baseCartItemUrl + "/decrement/:cartItemID",
  userAuthMiddleware,
  cartItemController.decrementCartItemQTY
);
router.delete(
  baseCartItemUrl + "/:cartItemID",
  userAuthMiddleware,
  cartItemController.deleteCartItem
);

module.exports = router;
