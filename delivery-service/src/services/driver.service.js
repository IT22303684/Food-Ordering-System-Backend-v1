import axios from "axios";
import { logger } from "../utils/logger.js";

const DRIVER_SERVICE_URL =
  process.env.DRIVER_SERVICE_URL || "http://localhost:3008";

export const getAvailableDrivers = async (
  latitude,
  longitude,
  maxDistance = 5000
) => {
  try {
    const response = await axios.get(
      `${DRIVER_SERVICE_URL}/api/drivers/available`,
      {
        params: {
          latitude,
          longitude,
          maxDistance,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    logger.error("Error fetching available drivers:", error.message);
    throw error;
  }
};

export const updateDriverAvailability = async (
  driverId,
  isAvailable,
  deliveryId 
) => {
  console.log("deliveryId", deliveryId);
  try {
    const response = await axios.put(
      `${DRIVER_SERVICE_URL}/api/drivers/${driverId}/availability`,
      {
        isAvailable,
        deliveryId,
      }
    );
    return response.data.data;
  } catch (error) {
    logger.error("Error updating driver availability:", error.message);
    throw error;
  }
};

export const completeDelivery = async (driverId) => {
  try {
    const response = await axios.put(
      `${DRIVER_SERVICE_URL}/api/drivers/${driverId}/complete`
    );
    return response.data.data;
  } catch (error) {
    logger.error("Error completing delivery:", error.message);
    throw error;
  }
};
