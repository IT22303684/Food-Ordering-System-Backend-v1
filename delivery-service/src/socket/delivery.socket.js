import { Delivery } from "../models/delivery.model.js";
import { logger } from "../utils/logger.js";

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    logger.info("New client connected");

    // Join delivery room for real-time updates
    socket.on("join-delivery", async (deliveryId) => {
      try {
        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
          socket.emit("error", { message: "Delivery not found" });
          return;
        }

        socket.join(`delivery:${deliveryId}`);
        logger.info(`Client joined delivery room: ${deliveryId}`);
      } catch (error) {
        logger.error("Error joining delivery room:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    // Handle location updates from drivers
    socket.on("update-location", async (data) => {
      try {
        const { deliveryId, location } = data;
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
          socket.emit("error", { message: "Delivery not found" });
          return;
        }

        delivery.driverLocation = location;
        await delivery.save();

        // Broadcast location update to all clients in the delivery room
        io.to(`delivery:${deliveryId}`).emit("location-updated", {
          deliveryId,
          location,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error("Error updating location:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    // Handle delivery status updates
    socket.on("update-status", async (data) => {
      try {
        const { deliveryId, status } = data;
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
          socket.emit("error", { message: "Delivery not found" });
          return;
        }

        delivery.status = status;
        await delivery.save();

        // Broadcast status update to all clients in the delivery room
        io.to(`delivery:${deliveryId}`).emit("status-updated", {
          deliveryId,
          status,
          timestamp: new Date(),
        });
      } catch (error) {
        logger.error("Error updating status:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });
  });
};
