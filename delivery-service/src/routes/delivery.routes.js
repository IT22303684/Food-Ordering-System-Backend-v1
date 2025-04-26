import express from "express";
import {
  assignDeliveryDriver,
  updateDeliveryStatus,
  getDeliveryStatus,
  getDriverLocation,
} from "../controllers/delivery.controller.js";

const router = express.Router();

// Assign a driver to a delivery
router.post("/assign", assignDeliveryDriver);

// Update delivery status
router.put("/:deliveryId/status", updateDeliveryStatus);

// Get delivery status
router.get("/:deliveryId/status", getDeliveryStatus);

// Get driver's current location for a delivery
router.get("/:deliveryId/location", getDriverLocation);

export default router;
