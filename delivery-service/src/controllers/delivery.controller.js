import { Delivery } from "../models/delivery.model.js";
import { logger } from "../utils/logger.js";
import axios from "axios";
import {
  getAvailableDrivers,
  updateDriverAvailability,
  completeDelivery,
} from "../services/driver.service.js";

// Service URLs
const DRIVER_SERVICE_URL =
  process.env.DRIVER_SERVICE_URL || "http://localhost:3010";

export const assignDeliveryDriver = async (req, res, next) => {
  try {
    const { orderId, customerLocation } = req.body;

    // Check if order already has a delivery
    const existingDelivery = await Delivery.findOne({ orderId });
    if (existingDelivery) {
      return res.status(400).json({
        status: "error",
        message: "Order already has a delivery assigned",
      });
    }

    // Get available drivers from driver service
    const availableDrivers = await getAvailableDrivers(
      customerLocation[1], // latitude
      customerLocation[0], // longitude
      5000 // max distance in meters
    );

    if (!availableDrivers || availableDrivers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No available drivers found in the area",
      });
    }

    // Assign the first available driver
    const assignedDriver = availableDrivers[0];

    // Create delivery record
    const delivery = new Delivery({
      orderId,
      driverId: assignedDriver._id,
      status: "ASSIGNED",
      customerLocation: {
        type: "Point",
        coordinates: customerLocation,
      },
      driverLocation: assignedDriver.location,
    });

    await delivery.save();

    // Update driver availability and assign delivery in driver service
    try {
      await updateDriverAvailability(assignedDriver._id, false, delivery._id);
    } catch (error) {
      logger.error("Error updating driver status:", error);
      // If driver update fails, delete the delivery to maintain consistency
      await Delivery.findByIdAndDelete(delivery._id);
      throw error;
    }

    // Schedule status update to PICKED_UP after 5 seconds
    setTimeout(async () => {
      try {
        delivery.status = "PICKED_UP";
        await delivery.save();

        // Emit delivery picked up event if Socket.IO is available
        const io = req.app.get("io");
        if (io) {
          io.emit("delivery-picked-up", {
            deliveryId: delivery._id,
            driverId: assignedDriver._id,
            orderId: orderId,
          });
        }

        logger.info(`Delivery ${delivery._id} status updated to PICKED_UP`);
      } catch (error) {
        logger.error("Error updating delivery status to PICKED_UP:", error);
      }
    }, 5000);

    // Emit delivery assigned event if Socket.IO is available
    const io = req.app.get("io");
    if (io) {
      io.emit("delivery-assigned", {
        deliveryId: delivery._id,
        driverId: assignedDriver._id,
        orderId: orderId,
      });
    }

    res.status(201).json({
      status: "success",
      data: delivery,
    });
  } catch (error) {
    logger.error("Error assigning delivery driver:", error);
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status, location } = req.body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({
        status: "error",
        message: "Delivery not found",
      });
    }

    // Update status
    delivery.status = status;

    // Update location if provided
    if (location) {
      delivery.driverLocation = {
        type: "Point",
        coordinates: location,
      };
    }

    // Update delivery completion time if delivered
    if (status === "DELIVERED") {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    res.json({
      status: "success",
      data: delivery,
    });
  } catch (error) {
    logger.error("Error updating delivery status:", error);
    next(error);
  }
};

export const getDeliveryStatus = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({
        status: "error",
        message: "Delivery not found",
      });
    }

    res.json({
      status: "success",
      data: delivery,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverLocation = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({
        status: "error",
        message: "Delivery not found",
      });
    }

    res.json({
      status: "success",
      data: {
        location: delivery.driverLocation,
        lastUpdated: delivery.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const delivery = await Delivery.findOne({ orderId });
    if (!delivery) {
      return res.status(404).json({
        status: "error",
        message: "Delivery not found for this order",
      });
    }

    res.json({
      status: "success",
      data: delivery,
    });
  } catch (error) {
    logger.error("Error getting delivery by orderId:", error);
    next(error);
  }
};
