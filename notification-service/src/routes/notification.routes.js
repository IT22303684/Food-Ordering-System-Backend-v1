import express from "express";
import { NotificationController } from "../controllers/notification.controller.js";

const router = express.Router();
const notificationController = new NotificationController();

// Create a new notification
router.post("/", notificationController.create.bind(notificationController));

// Get all notifications for a user
router.get(
  "/:userId",
  notificationController.getAll.bind(notificationController)
);

// Mark a notification as read
router.patch(
  "/:notificationId/read",
  notificationController.markAsRead.bind(notificationController)
);

// Delete a notification
router.delete(
  "/:notificationId",
  notificationController.delete.bind(notificationController)
);

export default router;
