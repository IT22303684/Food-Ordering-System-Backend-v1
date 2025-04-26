import emailService from "../services/email.service.js";
import logger from "../utils/logger.js";

export class EmailController {
  // Send rejection email for a restaurant
  async sendRejectionEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      logger.info('Sending rejection email', { email });
      await emailService.sendRejectionEmail(email);
      res.status(200).json({ message: 'Rejection email sent successfully' });
    } catch (error) {
      logger.error('Rejection email error', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error sending rejection email' });
    }
  }

  // Send approval email for a restaurant
  async sendApprovedEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      logger.info('Sending approval email', { email });
      await emailService.sendApprovedEmail(email);
      res.status(200).json({ message: 'Approval email sent successfully' });
    } catch (error) {
      logger.error('Approval email error', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error sending approval email' });
    }
  }

  // Send blocked email for a restaurant
  async sendBlockedEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      logger.info('Sending approval email', { email });
      await emailService.sendBlockedEmail(email);
      res.status(200).json({ message: 'Blocked email sent successfully' });
    } catch (error) {
      logger.error('Blocked email error', { error: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error sending approval email' });
    }
  }

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

  // send payment confomation email
  async sendPaymentConfirmationEmail(req, res) {
    try {
      const { email, paymentDetails } = req.body;
      console.log("Sending payment confirmation email to:", email);
      await emailService.sendPaymentConfirmationEmail(email, paymentDetails);
      res.status(200).json({ message: "Payment confirmation email sent successfully" });
    } catch (error) {
      console.error("Payment confirmation email error:", error.message);
      res.status(500).json({ message: "Error sending payment confirmation email" });
    }
  }
}
