import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, text, html = null) {
    try {
      console.log("Attempting to send email to:", to);
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Email sending error:", error.message);
      throw error;
    }
  }

  async sendVerificationEmail(to, pin) {
    const subject = "Email Verification";
    const text = `Your verification code is: ${pin}`;
    const html = `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${pin}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendPasswordResetEmail(to, token) {
    const subject = "Password Reset";
    const text = `Your password reset token is: ${token}`;
    const html = `
      <h1>Password Reset</h1>
      <p>Your password reset token is: <strong>${token}</strong></p>
      <p>This token will expire in 1 hour.</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendOrderConfirmation(to, orderDetails) {
    const subject = "Order Confirmation";
    const text = `Thank you for your order! Order ID: ${orderDetails.orderId}`;
    const html = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p>Order ID: ${orderDetails.orderId}</p>
      <p>Total Amount: $${orderDetails.totalAmount}</p>
      <p>Estimated Delivery Time: ${orderDetails.estimatedDeliveryTime}</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }

  async sendDeliveryUpdate(to, deliveryDetails) {
    const subject = "Delivery Update";
    const text = `Your order is on the way! Order ID: ${deliveryDetails.orderId}`;
    const html = `
      <h1>Delivery Update</h1>
      <p>Your order is on the way!</p>
      <p>Order ID: ${deliveryDetails.orderId}</p>
      <p>Status: ${deliveryDetails.status}</p>
      <p>Estimated Arrival: ${deliveryDetails.estimatedArrival}</p>
    `;

    return this.sendEmail(to, subject, text, html);
  }
}

export default new EmailService();
