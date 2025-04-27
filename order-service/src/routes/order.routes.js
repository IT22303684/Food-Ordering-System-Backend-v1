import express from "express";
import { orderController } from "../controllers/order.controller.js";
import {
  validateOrder,
  validateOrderStatus,
  validatePaymentStatus,
  validateRequest,
} from "../middleware/validate.middleware.js";

const router = express.Router();

// Routes
router.post("/", validateOrder, validateRequest, orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);
router.get("/user/:userId", orderController.getUserOrders);
router.get("/restaurant/:restaurantId", orderController.getRestaurantOrders);
router.get(
  "/restaurant/:restaurantId",
  validateRequest,
  orderController.getRestaurantOrders
)
router.patch(
  "/:orderId/status",
  validateOrderStatus,
  validateRequest,
  orderController.updateOrderStatus
);
router.patch(
  "/:orderId/payment",
  validatePaymentStatus,
  validateRequest,
  orderController.updatePaymentStatus
);
router.post("/:orderId/cancel", orderController.cancelOrder);
router.delete("/:orderId", orderController.deleteOrder);

//---- resturent routes -----------------


export default router;
