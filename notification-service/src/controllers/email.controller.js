import emailService from "../services/email.service.js";
import logger from "../utils/logger.js";

export class EmailController {
  async sendVerificationEmail(req, res) {
    try {
      const { email, pin } = req.body;
      console.log("Sending verification email to:", email);

      await emailService.sendVerificationEmail(email, pin);
      res.status(200).json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Verification email error:", error.message);
      res.status(500).json({ message: "Error sending verification email" });
    }
  }

  async sendPasswordResetEmail(req, res) {
    try {
      const { email, token } = req.body;
      console.log("Sending password reset email to:", email);

      await emailService.sendPasswordResetEmail(email, token);
      res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Password reset email error:", error.message);
      res.status(500).json({ message: "Error sending password reset email" });
    }
  }

  async sendOrderConfirmationEmail(req, res) {
    try {
      const { email, orderDetails } = req.body;
      console.log("Sending order confirmation email to:", email);

      await emailService.sendOrderConfirmation(email, orderDetails);
      res
        .status(200)
        .json({ message: "Order confirmation email sent successfully" });
    } catch (error) {
      console.error("Order confirmation email error:", error.message);
      res
        .status(500)
        .json({ message: "Error sending order confirmation email" });
    }
  }

  async sendOrderStatusUpdateEmail(req, res) {
    try {
      const { email, deliveryDetails } = req.body;
      console.log("Sending order status update email to:", email);

      await emailService.sendDeliveryUpdate(email, deliveryDetails);
      res
        .status(200)
        .json({ message: "Order status update email sent successfully" });
    } catch (error) {
      console.error("Order status update email error:", error.message);
      res
        .status(500)
        .json({ message: "Error sending order status update email" });
    }
  }
}
