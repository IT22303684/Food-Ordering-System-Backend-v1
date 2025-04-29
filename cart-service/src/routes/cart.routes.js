import express from "express";
import { cartController } from "../controllers/cart.controller.js";
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateRequest,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// Routes
router.get("/:userId", cartController.getCart);
router.post(
  "/:userId/items",
  validateAddToCart,
  validateRequest,
  cartController.addToCart
);
router.patch(
  "/:userId/items/:menuItemId",
  validateUpdateCartItem,
  validateRequest,
  cartController.updateCartItem
);
router.delete("/:userId/items/:menuItemId", cartController.removeFromCart);
router.delete("/:userId", cartController.clearCart);

export default router;
