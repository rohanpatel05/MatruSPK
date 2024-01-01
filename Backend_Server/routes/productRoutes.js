const express = require("express");
const multer = require("multer");
const router = express.Router();
const productController = require("../controllers/productController.js");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware.js");
const adminStafAuthMiddleware = require("../middlewares/adminStaffAuthMiddleware.js");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

let baseProductUrl = "/products";
router.get(
  baseProductUrl,
  adminStafAuthMiddleware,
  productController.getAllProduct
);
router.get(
  baseProductUrl + "/getAvailable",
  productController.getNonHiddenProduct
);
router.get(baseProductUrl + "/:productID", productController.getProductById);
router.get(
  baseProductUrl + "/search/:searchQuery",
  productController.searchProduct
);
router.post(
  baseProductUrl + "/create",
  upload.single("image"),
  adminAuthMiddleware,
  productController.createProduct
);
router.put(
  baseProductUrl + "/updatePI/:productID",
  adminAuthMiddleware,
  productController.updateProductInfo
);
router.put(
  baseProductUrl + "/updatePQ/:productID",
  adminStafAuthMiddleware,
  productController.updateQTY
);
router.post(
  baseProductUrl + "/updatePP",
  upload.single("image"),
  adminAuthMiddleware,
  productController.updateProductImage
);
// router.delete(
//   baseProductUrl + "/:productID",
//   adminAuthMiddleware,
//   productController.deleteProduct
// );

module.exports = router;
