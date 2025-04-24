import express from "express";
import { EmailController } from "../controllers/email.controller.js";

const router = express.Router();
const emailController = new EmailController();

// Send rejection email for a restaurant
router.post('/reject-restaurant', emailController.sendRejectionEmail);

// Send approval email for a restaurant
router.post('/approve-restaurant', emailController.sendApprovedEmail);

// Send verification email
router.post("/verify", emailController.sendVerificationEmail);

// Send password reset email
router.post("/reset-password", emailController.sendPasswordResetEmail);

// Send order confirmation email
router.post("/order-confirmation", emailController.sendOrderConfirmationEmail);

// Send order status update email
router.post("/order-status", emailController.sendOrderStatusUpdateEmail);

export default router;
