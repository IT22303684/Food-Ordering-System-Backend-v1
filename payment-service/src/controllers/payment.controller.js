import { processPayment, handlePayhereNotification } from "../services/payment.service.js";
import logger from "../utils/logger.js";

export const createPayment = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      orderId,
      restaurantId,
      items,
      totalAmount,
      paymentMethod,
      cardDetails,
    } = req.body;

    // Extract JWT token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("Authorization token missing");
    }

    // Use ngrok URL for PayHere
    const baseUrl = process.env.API_GATEWAY_URL || "http://localhost:3010";
    const returnUrl = `${baseUrl}/api/payments/return`;
    const cancelUrl = `${baseUrl}/api/payments/cancel`;
    const notifyUrl = `${baseUrl}/api/payments/notify`;

    const result = await processPayment({
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
      token, // Pass JWT token
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Payment initiated successfully",
    });
  } catch (error) {
    logger.error("Create payment error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleNotification = async (req, res) => {
  try {
    const notification = req.body;
    const result = await handlePayhereNotification(notification);
    res.status(200).json({
      success: true,
      data: result,
      message: "Notification processed successfully",
    });
  } catch (error) {
    logger.error("Notification handler error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleReturn = async (req, res) => {
  res.redirect("http://localhost:5173/orders");
};

export const handleCancel = async (req, res) => {
  res.redirect("http://localhost:5173/cart");
};