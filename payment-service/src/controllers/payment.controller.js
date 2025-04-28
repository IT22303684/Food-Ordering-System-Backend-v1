import { processPayment, handlePayhereNotification, getAllPaymentsService, refundPaymentService } from "../services/payment.service.js";
import { Payment } from "../models/payment.model.js";
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

    // Update the payment status to "COMPLETED"
    const payment = await Payment.findById(result.paymentId);
    if (!payment) {
      throw new Error("Payment record not found");
    }
    payment.paymentStatus = "COMPLETED";
    await payment.save();
    logger.info(`Payment status updated to COMPLETED for paymentId: ${result.paymentId}`);

    // Update the result to reflect the new payment status
    result.paymentStatus = "COMPLETED";

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
    logger.info("Starting handleNotification controller");
    const notification = req.body;
    const result = await handlePayhereNotification(notification);
    logger.info("Notification processed successfully", { paymentId: result.paymentId });
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
  logger.info("Handling payment return");
  res.redirect("http://localhost:5173/orders");
};

export const handleCancel = async (req, res) => {
  logger.info("Handling payment cancel");
  res.redirect("http://localhost:5173/cart");
};

export const getAllPayments = async (req, res) => {
  try {
    const { status, restaurantId, startDate, endDate, page = 1, limit = 10 } = req.query;
    const payments = await getAllPaymentsService({
      status,
      restaurantId,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    // Possible error point: accessing undefined property
    if (!payments.data.payments.length) { // Line ~100
      return res.status(200).json({
        success: true,
        data: { payments: [], pagination: payments.data.pagination },
        message: "No payments found",
      });
    }
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch payments",
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    logger.info("Starting refundPayment controller", { body: req.body });
    const { paymentId, reason } = req.body;
    if (!paymentId) {
      throw new Error("paymentId is required");
    }
    const adminId = req.headers["x-admin-id"] || "system_admin";
    logger.info("Calling refundPayment service", { paymentId, reason, adminId });
    const result = await refundPaymentService({ paymentId, reason, adminId });
    logger.info("Refund processed successfully", { paymentId: result.paymentId });
    res.status(200).json({
      success: true,
      data: result,
      message: "Payment refunded successfully",
    });
  } catch (error) {
    logger.error("Refund payment error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

