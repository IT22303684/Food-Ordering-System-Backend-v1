import { cartService } from "../services/cart.service.js";
import logger from "../utils/logger.js";

class CartController {
  async getCart(req, res) {
    try {
      const cart = await cartService.getCart(req.params.userId);
      res.json(cart);
    } catch (error) {
      logger.error("Error in getCart controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async addToCart(req, res) {
    try {
      const { userId } = req.params;
      logger.info("Received addToCart request:", {
        userId,
        body: req.body,
      });

      const itemData = {
        menuItemId: req.body.menuItemId,
        restaurantId: req.body.restaurantId,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        mainImage: req.body.mainImage,
        thumbnailImage: req.body.thumbnailImage,
      };

      logger.info("Processed itemData:", itemData);

      const cart = await cartService.addToCart(userId, itemData);
      logger.info("Item added to cart successfully", {
        userId,
        menuItemId: itemData.menuItemId,
      });
      res.status(201).json(cart);
    } catch (error) {
      logger.error("Error in addToCart controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async updateCartItem(req, res) {
    try {
      const { userId, menuItemId } = req.params;
      const { quantity } = req.body;

      const cart = await cartService.updateCartItem(
        userId,
        menuItemId,
        quantity
      );
      logger.info("Cart item updated successfully", {
        userId,
        menuItemId,
        quantity,
      });
      res.json(cart);
    } catch (error) {
      logger.error("Error in updateCartItem controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async removeFromCart(req, res) {
    try {
      const { userId, menuItemId } = req.params;
      const cart = await cartService.removeFromCart(userId, menuItemId);
      logger.info("Item removed from cart successfully", {
        userId,
        menuItemId,
      });
      res.json(cart);
    } catch (error) {
      logger.error("Error in removeFromCart controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      const { userId } = req.params;
      const cart = await cartService.clearCart(userId);
      logger.info("Cart cleared successfully", { userId });
      res.json(cart);
    } catch (error) {
      logger.error("Error in clearCart controller:", error);
      res.status(400).json({ message: error.message });
    }
  }
}

export const cartController = new CartController();
