import { orderService } from "../services/order.service.js";
import logger from "../utils/logger.js";

class OrderController {
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      logger.info("Order created successfully", { orderId: order._id });
      res.status(201).json(order);
    } catch (error) {
      logger.error("Error in createOrder controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.orderId);
      res.json(order);
    } catch (error) {
      logger.error("Error in getOrderById controller:", error);
      res.status(404).json({ message: error.message });
    }
  }

  async getUserOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      logger.error("Error in getUserOrders controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async getRestaurantOrders(req, res) {
    try {
      const orders = await orderService.getRestaurantOrders(
        req.params.restaurantId
      );
      res.json(orders);
    } catch (error) {
      logger.error("Error in getRestaurantOrders controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(orderId, status);
      logger.info("Order status updated", { orderId, status });
      res.json(order);
    } catch (error) {
      logger.error("Error in updateOrderStatus controller:", error);
      res.status(400).json({ message: error.message });
    }
  }
// Updates the status of a specific order by its order ID
  async updatePaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { paymentStatus, paymentId } = req.body;
      const order = await orderService.updatePaymentStatus(
        orderId,
        paymentStatus,
        paymentId
      );
      logger.info("Payment status updated", { orderId, paymentStatus });
      res.json(order);
    } catch (error) {
      logger.error("Error in updatePaymentStatus controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async cancelOrder(req, res) {
    try {
      const order = await orderService.cancelOrder(req.params.orderId);
      logger.info("Order cancelled", { orderId: order._id });
      res.json(order);
    } catch (error) {
      logger.error("Error in cancelOrder controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;
      await orderService.deleteOrder(orderId);
      logger.info("Order deleted successfully", { orderId });
      res.status(204).send();
    } catch (error) {
      logger.error("Error in deleteOrder controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // Fetches all orders associated with a specific restaurant ID
  async getRestaurantOrders(req, res) {
    try {
      const orders = await orderService.getRestaurantOrders(
        req.params.restaurantId
      );
      res.json(orders);
    } catch (error) {
      logger.error("Error in getRestaurantOrders controller:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // Updates the status of a specific order by its order ID
  // async updateOrderStatus(req, res) {
  //   try {
  //     const { orderId } = req.params;
  //     const { status } = req.body;
  //     const order = await orderService.updateOrderStatus(orderId, status);
  //     logger.info("Order status updated", { orderId, status });
  //     res.json(order);
  //   } catch (error) {
  //     logger.error("Error in updateOrderStatus controller:", error);
  //     res.status(400).json({ message: error.message });
  //   }
  // }

}

export const orderController = new OrderController();
