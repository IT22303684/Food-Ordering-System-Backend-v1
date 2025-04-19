// auth-service/src/routes/auth.routes.js
import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
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
router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
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
router.get("/profile", authenticate, getProfile);
router.patch(
  "/profile",
  authenticate,
  validateProfileUpdate,
  authController.updateProfile
);
router.post(
  "/change-password",
  authenticate,
  validateChangePassword,
  authController.changePassword
);
router.post("/logout", authenticate, authController.logout);

// Admin routes
router.get("/users", authenticate, authorize("ADMIN"), (req, res) => {
  // Admin functionality here
});

export default router;
