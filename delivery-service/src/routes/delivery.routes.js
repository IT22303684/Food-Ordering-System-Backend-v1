import express from "express";
import {
  assignDeliveryDriver,
  updateDeliveryStatus,
  getDeliveryStatus,
  getDriverLocation,
} from "../controllers/delivery.controller.js";

const router = express.Router();

// Assign delivery driver to an order
router.post("/assign", assignDeliveryDriver);

// Update delivery status
router.put("/:deliveryId/status", updateDeliveryStatus);

// Get delivery status
router.get("/:deliveryId/status", getDeliveryStatus);

// Get driver's current location
router.get("/:deliveryId/location", getDriverLocation);

export default router;
