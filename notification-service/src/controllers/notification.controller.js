import Notification from "../models/notification.model.js";
import logger from "../utils/logger.js";

export class NotificationController {
  async create(req, res) {
    try {
      const { userId, type, message, data } = req.body;

      const notification = new Notification({
        userId,
        type,
        message,
        data,
        isRead: false,
      });

      await notification.save();
      res.status(201).json(notification);
    } catch (error) {
      logger.error("Create notification error:", error);
      res.status(500).json({ message: "Error creating notification" });
    }
  }

  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const notifications = await Notification.find({ userId }).sort({
        createdAt: -1,
      });

      res.json(notifications);
    } catch (error) {
      logger.error("Get notifications error:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  }

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json(notification);
    } catch (error) {
      logger.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Error updating notification" });
    }
  }

  async delete(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      logger.error("Delete notification error:", error);
      res.status(500).json({ message: "Error deleting notification" });
    }
  }
}
