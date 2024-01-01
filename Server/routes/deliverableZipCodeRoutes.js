const express = require("express");
const deliverableZipCodeController = require("../controllers/deliverableZipCodeController");
const router = express.Router();
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware.js");

let baseDZCUrl = "/delZip";
router.get(
  baseDZCUrl,
  adminAuthMiddleware,
  deliverableZipCodeController.getAllZips
);
router.get(
  baseDZCUrl + "/isValidAddress/:zip",
  deliverableZipCodeController.isValidAddress
);
router.post(
  baseDZCUrl,
  adminAuthMiddleware,
  deliverableZipCodeController.createZip
);
router.delete(
  baseDZCUrl + "/:zip",
  adminAuthMiddleware,
  deliverableZipCodeController.deleteZip
);

module.exports = router;
