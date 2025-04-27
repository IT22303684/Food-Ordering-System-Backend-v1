import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Payment } from "../models/payment.model.js";
import logger from "../utils/logger.js";
import { emailClient } from "./email.client.js";

export const processPayment = async ({
  userId,
  cartId,
  orderId,
  restaurantId,
  items,
  totalAmount,
  paymentMethod,
  cardDetails,
  returnUrl,
  cancelUrl,
  notifyUrl,
  token,
}) => {
  try {
    // Validate inputs
    if (!userId || !cartId || !orderId || !restaurantId || !items || !totalAmount || !paymentMethod || !token) {
      throw new Error("Missing required fields");
    }
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.cardHolderName) {
      throw new Error("Invalid card details");
    }
    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    // Decode JWT to get user email
    let userData = {
      firstName: cardDetails.cardHolderName.split(" ")[0],
      lastName: cardDetails.cardHolderName.split(" ").slice(1).join(" ") || "N/A",
      email: "customer@example.com",
      phone: "0771234567",
      address: { street: "N/A", city: "Colombo", country: "Sri Lanka" },
    };

    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.email) {
        userData.email = decoded.email;
        logger.info(`Extracted email from JWT: ${userData.email}`);
      } else {
        logger.warn("No email found in JWT, using default");
      }
    } catch (error) {
      logger.warn("Failed to decode JWT:", error.message);
    }

    // Attempt to fetch additional user data (optional)
    try {
      const response = await axios.get(
        `${process.env.API_GATEWAY_URL}/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      logger.info("User service response:", response.data);
      const user = response.data.user || response.data.data || response.data;
      if (user) {
        userData = {
          firstName: user.firstName || userData.firstName,
          lastName: user.lastName || userData.lastName,
          email: userData.email, // Prioritize JWT email
          phone: user.phone || userData.phone,
          address: user.address || userData.address,
        };
      }
    } catch (error) {
      logger.warn("Failed to fetch user data:", error.message);
    }

    // Prepare PayHere payment request
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      throw new Error("PayHere merchant configuration missing");
    }

    const orderIdUnique = `${orderId}-${Date.now()}`;
    const currency = "LKR";
    const formattedAmount = Number(totalAmount).toFixed(2);

    // Generate PayHere hash
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();
    const hashString = `${merchantId}${orderIdUnique}${formattedAmount}${currency}${hashedSecret}`;
    logger.info("PayHere hash string:", hashString);
    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    const payherePayload = {
      merchant_id: merchantId,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      order_id: orderIdUnique,
      items: items.map((item) => item.name).join(", ") || "Order Items",
      currency,
      amount: formattedAmount,
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address: userData.address.street,
      city: userData.address.city,
      country: userData.address.country,
      custom_1: userId,
      custom_2: cartId,
    };

    logger.info("PayHere payload:", payherePayload);

    // Save initial payment record
    const payment = new Payment({
      userId,
      orderId,
      cartId,
      restaurantId,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: "PENDING",
      cardDetails: {
        maskedCardNumber: cardDetails.cardNumber.slice(-4).padStart(16, "****"),
        cardHolderName: cardDetails.cardHolderName,
      },
    });

    await payment.save();

    return {
      paymentId: payment._id,
      payherePayload,
      hash,
      paymentStatus: "PENDING",
    };
  } catch (error) {
    logger.error("Payment processing error:", error);
    throw new Error(`Payment initiation failed: ${error.message}`);
  }
};

export const handlePayhereNotification = async (notification) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      status_code,
      status_message,
      md5sig,
    } = notification;

    // Verify PayHere signature
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();
    const localMd5sig = crypto
      .createHash("md5")
      .update(
        `${merchant_id}${order_id}${payment_id}${status_code}${hashedSecret}`
      )
      .digest("hex")
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      throw new Error("Invalid PayHere signature");
    }

    // Find payment by orderId
    const originalOrderId = order_id.split("-")[0];
    const payment = await Payment.findOne({ orderId: originalOrderId });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status
    let paymentStatus = "PENDING";
    if (status_code === "2") {
      paymentStatus = "COMPLETED";
    } else if (status_code === "-1" || status_code === "-2") {
      paymentStatus = "FAILED";
    } else if (status_code === "-3") {
      paymentStatus = "REFUNDED";
    } else if (status_code === "0") {
      paymentStatus = "PENDING";
    }

    payment.paymentStatus = paymentStatus;
    payment.payhereTransactionId = payment_id;
    payment.payhereStatusCode = status_code;
    payment.payhereStatusMessage = status_message;
    await payment.save();

    logger.info(`Payment status updated: ${paymentStatus} for order ${originalOrderId}`);

    // Update order status
    let orderStatus = "PENDING";
    let orderPaymentStatus = "PENDING";
    if (paymentStatus === "COMPLETED") {
      orderStatus = "CONFIRMED";
      orderPaymentStatus = "PAID";
    } else if (paymentStatus === "FAILED") {
      orderStatus = "CANCELLED";
      orderPaymentStatus = "FAILED";
    } else if (paymentStatus === "REFUNDED") {
      orderStatus = "CANCELLED";
      orderPaymentStatus = "REFUNDED";
    }

    try {
      await axios.patch(
        `${process.env.API_GATEWAY_URL}/api/orders/${payment.orderId}`,
        {
          paymentStatus: orderPaymentStatus,
          status: orderStatus,
        }
      );
      logger.info(`Order status updated: ${orderStatus} for order ${payment.orderId}`);
    } catch (error) {
      logger.error("Failed to update order:", error.message);
      throw new Error("Order update failed");
    }

    // Clear cart and send email if payment is COMPLETED
    if (paymentStatus === "COMPLETED") {
      try {
        await axios.delete(
          `${process.env.API_GATEWAY_URL}/api/carts/${payment.cartId}`
        );
        logger.info(`Cart cleared for cartId ${payment.cartId}`);
      } catch (error) {
        logger.error("Failed to clear cart:", error.message);
      }

      // Send payment confirmation email
      try {
        // Fetch user email from payment record or JWT (stored in payherePayload.email)
        let userEmail = payment.payherePayload?.email || "customer@example.com";
        try {
          const userResponse = await axios.get(
            `${process.env.API_GATEWAY_URL}/api/users/${payment.userId}`
          );
          const user = userResponse.data.user || userResponse.data.data || userResponse.data;
          if (user && user.email) {
            userEmail = user.email;
          }
        } catch (error) {
          logger.warn("Failed to fetch user email, using stored email:", error.message);
        }

        await emailClient.sendPaymentConfirmationEmail(userEmail, {
          orderId: payment.orderId,
          totalAmount: payment.totalAmount,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.payhereTransactionId,
          items: payment.items,
        });
        logger.info(`Payment confirmation email sent to ${userEmail}`);
      } catch (error) {
        logger.error("Failed to send payment confirmation email:", error.message);
      }
    }

    return { success: true, paymentId: payment._id, paymentStatus };
  } catch (error) {
    logger.error("PayHere notification error:", error);
    throw new Error(`Notification processing failed: ${error.message}`);
  }
};