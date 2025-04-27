import { Driver } from "../models/driver.model.js";
import { logger } from "../utils/logger.js";
import { updateDeliveryStatus } from "../services/delivery.service.js";

export const registerDriver = async (req, res, next) => {
  try {
    const { userId, vehicleType, vehicleNumber, location } = req.body;

    // Validate required fields
    if (!userId || !vehicleType || !vehicleNumber || !location) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Check if driver profile already exists for this userId
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({
        status: "error",
        message: "Driver profile already exists for this user",
      });
    }

    // Create new driver
    const driver = new Driver({
      userId,
      vehicleType,
      vehicleNumber,
      location: {
        type: "Point",
        coordinates: location,
      },
      isAvailable: true,
    });

    await driver.save();

    res.status(201).json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    logger.error("Error registering driver:", error);
    next(error);
  }
};

export const updateDriverLocation = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { location } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    driver.location = {
      type: "Point",
      coordinates: location,
    };

    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriverAvailability = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { isAvailable, deliveryId } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    // If driver has an active delivery, prevent changing availability
    if (driver.currentDelivery) {
      return res.status(400).json({
        status: "error",
        message:
          "Cannot change availability while having an active delivery. Please complete or cancel the delivery first.",
      });
    }

    // If setting to unavailable and providing a deliveryId
    if (!isAvailable && deliveryId) {
      driver.currentDelivery = deliveryId;
      driver.isAvailable = false; // Force isAvailable to false when assigned a delivery
    }

    // If setting to available, clear currentDelivery
    if (isAvailable) {
      driver.currentDelivery = null;
      driver.isAvailable = true;
    }

    await driver.save();

    res.json({
      status: "success",
      message: isAvailable
        ? "You are now online and available for deliveries"
        : "You are now offline",
      data: driver,
    });
  } catch (error) {
    logger.error("Error updating driver availability:", error);
    next(error);
  }
};

// Add middleware to check driver availability
export const checkDriverAvailability = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    // If driver has a current delivery, force isAvailable to false
    if (driver.currentDelivery && driver.isAvailable) {
      driver.isAvailable = false;
      await driver.save();
    }

    next();
  } catch (error) {
    logger.error("Error checking driver availability:", error);
    next(error);
  }
};

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    let query = { isAvailable: true };

    if (latitude && longitude) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }

    const drivers = await Driver.find(query);

    res.json({
      status: "success",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverDetails = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const driver = await Driver.findById(driverId);

    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

export const assignDelivery = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { deliveryId } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    // Check if driver is already assigned to a delivery
    if (driver.currentDelivery) {
      return res.status(400).json({
        status: "error",
        message: "Driver is already assigned to a delivery",
      });
    }

    // Check if driver is available
    if (!driver.isAvailable) {
      return res.status(400).json({
        status: "error",
        message: "Driver is not available",
      });
    }

    // Update delivery status to PICKED_UP
    await updateDeliveryStatus(
      deliveryId,
      "PICKED_UP",
      driver.location.coordinates
    );

    // Update driver status
    driver.currentDelivery = deliveryId;
    driver.isAvailable = false;
    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    logger.error("Error assigning delivery:", error);
    next(error);
  }
};

export const completeDelivery = async (req, res, next) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver not found",
      });
    }

    // Check if driver has an active delivery
    if (!driver.currentDelivery) {
      return res.status(400).json({
        status: "error",
        message: "Driver has no active delivery",
      });
    }

    // Update delivery status in delivery service
    await updateDeliveryStatus(
      driver.currentDelivery,
      "DELIVERED",
      driver.location.coordinates
    );

    // Update driver status
    driver.isAvailable = true;
    driver.currentDelivery = null;
    driver.totalDeliveries += 1;
    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    logger.error("Error completing delivery:", error);
    next(error);
  }
};

export const getCurrentDriver = async (req, res, next) => {
  try {
    // Get userId from query parameters
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    // Find driver by userId
    const driver = await Driver.findOne({ userId });

    if (!driver) {
      return res.status(404).json({
        status: "error",
        message: "Driver profile not found",
      });
    }

    res.json({
      status: "success",
      data: {
        _id: driver._id,
        userId: driver.userId,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
        location: driver.location,
        isAvailable: driver.isAvailable,
        currentDelivery: driver.currentDelivery,
        totalDeliveries: driver.totalDeliveries,
        createdAt: driver.createdAt,
        updatedAt: driver.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Error getting current driver:", error);
    next(error);
  }
};
