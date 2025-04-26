import { Delivery } from "../models/delivery.model.js";
import { logger } from "../utils/logger.js";
import {
  getAvailableDrivers,
  updateDriverAvailability,
} from "../services/driver.service.js";

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
    await updateDriverAvailability(assignedDriver._id, false, delivery._id);

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

    // If delivery is completed, update driver availability
    if (status === "DELIVERED" || status === "CANCELLED") {
      await updateDriverAvailability(delivery.driverId, true);
    }

    await delivery.save();

    // Emit status update event if Socket.IO is available
    const io = req.app.get("io");
    if (io) {
      io.emit("delivery-status-updated", {
        deliveryId: delivery._id,
        status: status,
        location: delivery.driverLocation,
      });
    }

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
