const express = require("express");
const additionalChargesController = require("../controllers/additionalChargesController");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware.js");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");

const router = express.Router();

let baseAdditionalChargesUrl = "/charges";
router.get(
  baseAdditionalChargesUrl,
  adminAuthMiddleware,
  additionalChargesController.getAllCharges
);
router.get(
  baseAdditionalChargesUrl + "/:cartID",
  userAuthMiddleware,
  additionalChargesController.calculateCharges
);
router.put(
  baseAdditionalChargesUrl + "/:name",
  adminAuthMiddleware,
  additionalChargesController.updateACharge
);

module.exports = router;
