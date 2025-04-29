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

  // Send rejection email for a restaurant
  async sendRejectionEmail(to) {
    const subject = 'Restaurant Application Rejected';
    const text = `Dear Restaurant Owner,

We regret to inform you that your restaurant application has been rejected. This decision may be due to incomplete documentation, non-compliance with our guidelines, or other factors.

Please review our requirements and guidelines, update your application, and resubmit. If you have any questions or need further clarification, feel free to contact our support team.

Thank you for your understanding.

Best regards,
The Foodie Platform Team
support@foodieplatform.com
+1-800-555-1234`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px; color: #333333;">
        <!-- Header -->
        <div style="background-color: #FF6200; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Restaurant Application Rejected</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; border: 1px solid #FF6200; border-top: none; border-radius: 0 0 5px 5px;">
          <p style="font-size: 16px; line-height: 1.5;">Dear Restaurant Owner,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            We regret to inform you that your restaurant application has been rejected. This decision may be due to incomplete documentation, non-compliance with our guidelines, or other factors.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Please review our requirements and guidelines, update your application, and resubmit. If you have any questions or need further clarification, feel free to contact our support team.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            Thank you for your understanding.
          </p>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="mailto:support@foodieplatform.com" style="background-color: #FF6200; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              Contact Support
            </a>
          </div>

          <!-- Signature -->
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            The Foodie Platform Team
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #333333; border-top: 1px solid #FF6200; margin-top: 20px;">
          <p>Foodie Platform | support@foodieplatform.com | +1-800-555-1234</p>
          <p>&copy; 2025 Foodie Platform. All rights reserved.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }

  // Send approval email for a restaurant
  async sendApprovedEmail(to) {
    const subject = 'Restaurant Application Approved';
    const text = `Dear Restaurant Owner,

Congratulations! Your restaurant application has been approved. You can now start managing your restaurant on the Foodie Platform.

Here are your next steps:
1. Log in to your account at foodieplatform.com.
2. Set up your restaurant profile, menu, and operating hours.
3. Start accepting orders and grow your business!

If you need assistance, our support team is here to help.

Best regards,
The Foodie Platform Team
support@foodieplatform.com
+1-800-555-1234`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px; color: #333333;">
        <!-- Header -->
        <div style="background-color: #FF6200; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Restaurant Application Approved</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; border: 1px solid #FF6200; border-top: none; border-radius: 0 0 5px 5px;">
          <p style="font-size: 16px; line-height: 1.5;">Dear Restaurant Owner,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            Congratulations! Your restaurant application has been approved. You can now start managing your restaurant on the Foodie Platform.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">Here are your next steps:</p>
          <ul style="font-size: 16px; line-height: 1.5; margin-left: 20px;">
            <li>Log in to your account at <a href="http://foodieplatform.com" style="color: #FF6200; text-decoration: underline;">foodieplatform.com</a>.</li>
            <li>Set up your restaurant profile, menu, and operating hours.</li>
            <li>Start accepting orders and grow your business!</li>
          </ul>
          <p style="font-size: 16px; line-height: 1.5;">
            If you need assistance, our support team is here to help.
          </p>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="http://foodieplatform.com/login" style="background-color: #FF6200; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              Log In Now
            </a>
          </div>

          <!-- Signature -->
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            The Foodie Platform Team
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #333333; border-top: 1px solid #FF6200; margin-top: 20px;">
          <p>Foodie Platform | support@foodieplatform.com | +1-800-555-1234</p>
          <p>&copy; 2025 Foodie Platform. All rights reserved.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
  }

  // Send blocked email for a restaurant
  async sendBlockedEmail(to) {
    const subject = 'Restaurant Account Blocked';
    const text = `Dear Restaurant Owner,

We regret to inform you that your restaurant account has been blocked. This action may have been taken due to a violation of our terms of service, repeated customer complaints, or other issues.

To resolve this, please contact our support team for more details and to discuss the next steps.

Best regards,
The Foodie Platform Team
support@foodieplatform.com
+1-800-555-1234`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px; color: #333333;">
        <!-- Header -->
        <div style="background-color: #FF6200; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Restaurant Account Blocked</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px; border: 1px solid #FF6200; border-top: none; border-radius: 0 0 5px 5px;">
          <p style="font-size: 16px; line-height: 1.5;">Dear Restaurant Owner,</p>
          <p style="font-size: 16px; line-height: 1.5;">
            We regret to inform you that your restaurant account has been blocked. This action may have been taken due to a violation of our terms of service, repeated customer complaints, or other issues.
          </p>
          <p style="font-size: 16px; line-height: 1.5;">
            To resolve this, please contact our support team for more details and to discuss the next steps.
          </p>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="mailto:support@foodieplatform.com" style="background-color: #FF6200; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              Contact Support
            </a>
          </div>

          <!-- Signature -->
          <p style="font-size: 16px; line-height: 1.5;">
            Best regards,<br>
            The Foodie Platform Team
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 10px; font-size: 12px; color: #333333; border-top: 1px solid #FF6200; margin-top: 20px;">
          <p>Foodie Platform | support@foodieplatform.com | +1-800-555-1234</p>
          <p>&copy; 2025 Foodie Platform. All rights reserved.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, subject, text, html);
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

  // send payment confirmation email 
  async sendPaymentConfirmationEmail(to, paymentDetails) {
    const subject = "Payment Confirmation";
    const text = `Your payment for order ${paymentDetails.orderId} has been successfully processed!`;
    const itemsList = paymentDetails.items
      .map(item => `<li>${item.name} - $${item.price} x ${item.quantity} = $${item.totalPrice}</li>`)
      .join("");
    const html = `
      <h1>Payment Confirmation</h1>
      <p>Your payment for order <strong>${paymentDetails.orderId}</strong> has been successfully processed!</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Total Amount: $${paymentDetails.totalAmount}</li>
        <li>Payment Method: ${paymentDetails.paymentMethod}</li>
        <li>Transaction ID: ${paymentDetails.transactionId}</li>
      </ul>
      <p><strong>Items:</strong></p>
      <ul>${itemsList}</ul>
      <p>Thank you for your purchase!</p>
    `;
    return this.sendEmail(to, subject, text, html);
  }
}

export default new EmailService();
