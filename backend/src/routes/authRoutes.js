const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", authController.test);
router.post(
  "/register",
  upload.single("profilePhoto"),
  authController.register,
);
router.post("/login", authController.login);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:userId/:token", authController.resetPassword);
router.post("/refresh", authController.refreshToken);

module.exports = router;
