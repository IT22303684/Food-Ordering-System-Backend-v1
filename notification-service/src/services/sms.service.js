import twilio from "twilio";
import logger from "../utils/logger.js";

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSMS(to, message) {
    try {
      const response = await this.client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      logger.info(`SMS sent: ${response.sid}`);
      return response;
    } catch (error) {
      logger.error("SMS sending error:", error);
      throw error;
    }
  }

  async sendOrderConfirmation(to, orderDetails) {
    const message = `Thank you for your order! Order ID: ${orderDetails.orderId}. Total: $${orderDetails.totalAmount}. Estimated delivery: ${orderDetails.estimatedDeliveryTime}`;
    return this.sendSMS(to, message);
  }

  async sendDeliveryUpdate(to, deliveryDetails) {
    const message = `Your order is on the way! Order ID: ${deliveryDetails.orderId}. Status: ${deliveryDetails.status}. Estimated arrival: ${deliveryDetails.estimatedArrival}`;
    return this.sendSMS(to, message);
  }
}

export default new SMSService();
