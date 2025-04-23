import { body, validationResult } from "express-validator";
import logger from "../utils/logger.js";

export const validateOrder = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("restaurantId").notEmpty().withMessage("Restaurant ID is required"),
  body("items").isArray().withMessage("Items must be an array"),
  body("items.*.menuItemId").notEmpty().withMessage("Menu item ID is required"),
  body("items.*.name").notEmpty().withMessage("Item name is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("deliveryAddress")
    .isObject()
    .withMessage("Delivery address is required"),
  body("deliveryAddress.street").notEmpty().withMessage("Street is required"),
  body("deliveryAddress.city").notEmpty().withMessage("City is required"),
  body("deliveryAddress.state").notEmpty().withMessage("State is required"),
  body("deliveryAddress.zipCode")
    .notEmpty()
    .withMessage("Zip code is required"),
  body("deliveryAddress.country").notEmpty().withMessage("Country is required"),
  body("paymentMethod")
    .isIn(["CREDIT_CARD", "DEBIT_CARD", "CASH", "WALLET"])
    .withMessage("Invalid payment method"),
];

export const validateOrderStatus = [
  body("status")
    .isIn([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ])
    .withMessage("Invalid order status"),
];

export const validatePaymentStatus = [
  body("paymentStatus")
    .isIn(["PENDING", "PAID", "FAILED", "REFUNDED"])
    .withMessage("Invalid payment status"),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation error:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
