const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const userExistMiddleware = require("../middlewares/userExistMiddleware.js");
const userAuthMiddleware = require("../middlewares/userAuthMiddleware.js");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware.js");

let baseUserUrl = "/users";
// User table CRUD operations
router.get(baseUserUrl, adminAuthMiddleware, userController.getAllStaff);
router.get(
  baseUserUrl + "/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.getUserByEmail
);
router.put(
  baseUserUrl + "/updateUI/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.updateUserInfo
);
router.put(
  baseUserUrl + "/updateEmail/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.updateEmail
);
router.put(
  baseUserUrl + "/updatePass/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.updatePassword
);
router.put(
  baseUserUrl + "/updateAdd/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.updateAddress
);
router.delete(
  baseUserUrl + "/:userEmail",
  userExistMiddleware,
  userAuthMiddleware,
  userController.deleteUser
);

// user authentication
router.post(baseUserUrl + "/registerUser", userController.createUser);
router.post(
  baseUserUrl + "/registerStaff",
  adminAuthMiddleware,
  userController.createStaff
);
// router.post(baseUserUrl + "/registerAdmin", userController.createAdmin);
router.post(baseUserUrl + "/login", userController.logIn);
router.post(baseUserUrl + "/refresh", userController.refresh);

module.exports = router;
