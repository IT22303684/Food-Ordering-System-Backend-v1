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
  validateUpdateUser,
  validateUpdateUserStatus,
  validateUpdateUserRole,
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

// Authentication verification endpoint for other services
router.post("/verify", auth, authController.verifyAuth);

// Admin routes
//router.get("/users", auth, authorize("ADMIN"), );
router.get("/users", auth, authorize("ADMIN"), authController.getAllUsers);
router.get("/users/:id", auth, authorize("ADMIN"), authController.getUserById);
router.patch(
  "/users/:id",
  auth,
  authorize("ADMIN"),
  validateUpdateUser,
  authController.updateUser
);
router.delete("/users/:id", auth, authorize("ADMIN"), authController.deleteUser);
router.patch(
  "/users/:id/status",
  auth,
  authorize("ADMIN"),
  validateUpdateUserStatus,
  authController.updateUserStatus
);
router.patch(
  "/users/:id/role",
  auth,
  authorize("ADMIN"),
  validateUpdateUserRole,
  authController.updateUserRole
);

export default router;
