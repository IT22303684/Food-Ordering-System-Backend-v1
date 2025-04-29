import express from "express";
import {
  registerDriver,
  updateDriverLocation,
  updateDriverAvailability,
  getAvailableDrivers,
  getDriverDetails,
  assignDelivery,
  completeDelivery,
  getCurrentDriver,
} from "../controllers/driver.controller.js";

const router = express.Router();

// Register a new driver
router.post("/register", registerDriver);

// Get current driver details
router.get("/me", getCurrentDriver);

// Update driver's current location
router.put("/:driverId/location", updateDriverLocation);

// Update driver's availability status
router.put("/:driverId/availability", updateDriverAvailability);

// Get available drivers (with optional location filter)
router.get("/available", getAvailableDrivers);

// Get driver details
router.get("/:driverId", getDriverDetails);

// Assign delivery to driver
router.post("/:driverId/assign", assignDelivery);

// Complete delivery
router.post("/:driverId/complete", completeDelivery);

export default router;
