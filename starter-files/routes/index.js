const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { catchErrors } = require("../handlers/errorHandlers");
// Do work here

router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/store/:slug", catchErrors(storeController.getStoreBySlug));
router.get("/stores/:id/edit", catchErrors(storeController.editStore));

router.get("/add", authController.isLoggedIn, storeController.addStore);
router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get("/tags", catchErrors(storeController.getStoreByTag));
router.get("/tags/:tag", catchErrors(storeController.getStoreByTag));
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get("/logout", authController.logout);

router.get("/account", userController.account);
router.post("/account", catchErrors(userController.updateAccount));
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:token", catchErrors(authController.reset));
router.post(
  "/account/reset/:token",
  authController.confirmPasswords,
  catchErrors(authController.update)
);
module.exports = router;
