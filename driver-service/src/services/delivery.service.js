import axios from "axios";
import { logger } from "../utils/logger.js";

const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL || "http://localhost:3010";

export const updateDeliveryStatus = async (deliveryId, status, location) => {
  try {
    const response = await axios.put(
      `${DELIVERY_SERVICE_URL}/api/delivery/${deliveryId}/status`,
      {
        status,
        location,
      }
    );

    logger.info(`Delivery status updated: ${deliveryId} - ${status}`);
    return response.data;
  } catch (error) {
    logger.error("Error updating delivery status:", error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error("Response data:", error.response.data);
      logger.error("Response status:", error.response.status);
      logger.error("Response headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      logger.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error("Error setting up request:", error.message);
    }
    throw error;
  }
};
