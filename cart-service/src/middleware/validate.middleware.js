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
  body("mainImage").notEmpty().withMessage("Main image URL is required"),
  body("thumbnailImage")
    .notEmpty()
    .withMessage("Thumbnail image URL is required"),
];

export const validateUpdateCartItem = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

export const validateRequest = (req, res, next) => {
  logger.info("Validating request body:", req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error("Validation error:", {
      errors: errors.array(),
      body: req.body,
    });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
