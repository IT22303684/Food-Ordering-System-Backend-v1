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
  body("totalAmount")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be a positive number"),
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
];

export const validateOrderStatus = [
  body("status")
    .isIn([
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ])
    .withMessage("Invalid order status"),
];

export const validatePaymentStatus = [
  body("paymentStatus")
    .isIn(["pending", "completed", "failed"])
    .withMessage("Invalid payment status"),
  body("paymentId").notEmpty().withMessage("Payment ID is required"),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation error:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
