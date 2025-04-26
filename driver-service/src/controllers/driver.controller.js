import { Driver } from "../models/driver.model.js";
import { logger } from "../utils/logger.js";

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

    // If setting to unavailable, require deliveryId
    if (!isAvailable && !deliveryId) {
      return res.status(400).json({
        status: "error",
        message: "Delivery ID is required when setting driver as unavailable",
      });
    }

    // If setting to available, clear currentDelivery
    if (isAvailable) {
      driver.currentDelivery = null;
    } else {
      driver.currentDelivery = deliveryId;
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
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

    driver.currentDelivery = deliveryId;
    driver.isAvailable = false;
    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
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

    driver.isAvailable = true;
    driver.currentDelivery = null;
    driver.totalDeliveries += 1;
    await driver.save();

    res.json({
      status: "success",
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};
