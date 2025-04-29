import { Cart } from "../models/cart.model.js";
import logger from "../utils/logger.js";

class CartService {
  async getCart(userId) {
    try {
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [], restaurantId: null });
        await cart.save();
      }
      return cart;
    } catch (error) {
      logger.error("Error getting cart:", error);
      throw new Error(`Error getting cart: ${error.message}`);
    }
  }

  async addToCart(userId, itemData) {
    try {
      let cart = await Cart.findOne({ userId });

      // If cart doesn't exist, create a new one
      if (!cart) {
        cart = new Cart({
          userId,
          restaurantId: itemData.restaurantId,
          items: [],
          totalAmount: 0,
        });
      }

      // Check if item is from the same restaurant
      if (
        cart.items.length > 0 &&
        cart.restaurantId !== itemData.restaurantId
      ) {
        throw new Error(
          "Cannot add items from different restaurants to the same cart"
        );
      }

      // Set restaurant ID if cart is empty
      if (cart.items.length === 0) {
        cart.restaurantId = itemData.restaurantId;
      }

      // Calculate total price for the item
      const totalPrice = itemData.price * itemData.quantity;

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.menuItemId === itemData.menuItemId
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const existingItem = cart.items[existingItemIndex];
        existingItem.quantity += itemData.quantity;
        existingItem.totalPrice += totalPrice;
        // Preserve image fields
        existingItem.mainImage = itemData.mainImage || existingItem.mainImage;
        existingItem.thumbnailImage =
          itemData.thumbnailImage || existingItem.thumbnailImage;
      } else {
        // Create new cart item with all required fields
        const newItem = {
          menuItemId: itemData.menuItemId,
          restaurantId: itemData.restaurantId,
          name: itemData.name,
          price: itemData.price,
          quantity: itemData.quantity,
          totalPrice: totalPrice,
          mainImage: itemData.mainImage || "",
          thumbnailImage: itemData.thumbnailImage || "",
        };

        // Add new item to cart
        cart.items.push(newItem);
      }

      // Calculate total amount
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );

      // Save the cart
      const savedCart = await cart.save();
      return savedCart;
    } catch (error) {
      logger.error("Error adding to cart:", error);
      throw new Error(`Error adding to cart: ${error.message}`);
    }
  }

  async updateCartItem(userId, menuItemId, quantity) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("Cart not found");
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.menuItemId === menuItemId
      );
      if (itemIndex === -1) {
        throw new Error("Item not found in cart");
      }

      // Update quantity and total price while preserving other fields
      const item = cart.items[itemIndex];
      item.quantity = quantity;
      item.totalPrice = item.price * quantity;

      await cart.save();
      return cart;
    } catch (error) {
      logger.error("Error updating cart item:", error);
      throw new Error(`Error updating cart item: ${error.message}`);
    }
  }

  async removeFromCart(userId, menuItemId) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("Cart not found");
      }

      cart.items = cart.items.filter((item) => item.menuItemId !== menuItemId);

      // Reset restaurant ID if cart becomes empty
      if (cart.items.length === 0) {
        cart.restaurantId = null;
      }

      await cart.save();
      return cart;
    } catch (error) {
      logger.error("Error removing from cart:", error);
      throw new Error(`Error removing from cart: ${error.message}`);
    }
  }

  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new Error("Cart not found");
      }

      cart.items = [];
      cart.restaurantId = null;
      cart.totalAmount = 0;

      await cart.save();
      return cart;
    } catch (error) {
      logger.error("Error clearing cart:", error);
      throw new Error(`Error clearing cart: ${error.message}`);
    }
  }
}

export const cartService = new CartService();
