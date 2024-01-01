const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController.js");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware.js");

let baseCategoryUrl = "/categories";
router.get(
  baseCategoryUrl,
  adminAuthMiddleware,
  categoryController.getAllCategory
);
router.get(
  baseCategoryUrl + "/getAvailable",
  categoryController.getNonHiddenCategory
);
router.post(
  baseCategoryUrl,
  adminAuthMiddleware,
  categoryController.createCategory
);
router.put(
  baseCategoryUrl + "/:categoryID",
  adminAuthMiddleware,
  categoryController.updateCategory
);
router.delete(
  baseCategoryUrl + "/:categoryID",
  adminAuthMiddleware,
  categoryController.deleteCategory
);

module.exports = router;
