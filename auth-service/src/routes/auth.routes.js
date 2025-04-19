// auth-service/src/routes/auth.routes.js
import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { auth, authorize } from "../middleware/auth.middleware.js";
import {
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
  validateChangePassword,
} from "../validation/auth.validation.js";

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.post(
  "/verify-email",
  validateEmailVerification,
  authController.verifyEmail
);
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  validateResetPassword,
  authController.resetPassword
);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.patch(
  "/profile",
  auth,
  validateProfileUpdate,
  authController.updateProfile
);
router.post(
  "/change-password",
  auth,
  validateChangePassword,
  authController.changePassword
);
router.post("/logout", auth, authController.logout);

// Admin routes
router.get("/users", auth, authorize("ADMIN"), (req, res) => {
  // Admin functionality here
});

export default router;
