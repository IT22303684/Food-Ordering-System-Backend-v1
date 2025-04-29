import { Order } from "../models/order.model.js";
import logger from "../utils/logger.js";

class OrderService {
  async createOrder(orderData) {
    try {
      const order = new Order(orderData);
      return await order.save();
    } catch (error) {
      logger.error("Error creating order:", error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      logger.error("Error fetching order:", error);
      throw new Error(`Error fetching order: ${error.message}`);
    }
  }

  async getUserOrders(userId) {
    try {
      return await Order.find({ userId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error("Error fetching user orders:", error);
      throw new Error(`Error fetching user orders: ${error.message}`);
    }
  }

  async getRestaurantOrders(restaurantId) {
    try {
      return await Order.find({ restaurantId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error("Error fetching restaurant orders:", error);
      throw new Error(`Error fetching restaurant orders: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      logger.error("Error updating order status:", error);
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  async updatePaymentStatus(orderId, paymentStatus, paymentId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus, paymentId },
        { new: true }
      );
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      logger.error("Error updating payment status:", error);
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  }

  async cancelOrder(orderId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { status: "cancelled" },
        { new: true }
      );
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      logger.error("Error cancelling order:", error);
      throw new Error(`Error cancelling order: ${error.message}`);
    }
  }

  async deleteOrder(orderId) {
    try {
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      logger.info("Order deleted from database", { orderId });
    } catch (error) {
      logger.error("Error deleting order:", error);
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }

  // Retrieves all orders for a given restaurant ID, sorted by creation date (newest first)
  async getRestaurantOrders(restaurantId) {
    try {
      return await Order.find({ restaurantId }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error("Error fetching restaurant orders:", error);
      throw new Error(`Error fetching restaurant orders: ${error.message}`);
    }
  }

  // Updates the status of an order by its ID and returns the updated order
  // async updateOrderStatus(orderId, status) {
  //   try {
  //     const order = await Order.findByIdAndUpdate(
  //       orderId,
  //       { status },
  //       { new: true }
  //     );
  //     if (!order) {
  //       throw new Error("Order not found");
  //     }
  //     return order;
  //   } catch (error) {
  //     logger.error("Error updating order status:", error);
  //     throw new Error(`Error updating order status: ${error.message}`);
  //   }
  // }
}

export const orderService = new OrderService();
