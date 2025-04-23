import { body, validationResult } from "express-validator";
import logger from "../utils/logger.js";

export const validateAddToCart = [
  body("menuItemId").notEmpty().withMessage("Menu item ID is required"),
  body("restaurantId").notEmpty().withMessage("Restaurant ID is required"),
  body("name").notEmpty().withMessage("Item name is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const validateUpdateCartItem = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation error:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
