import express from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import upload from '../middleware/upload.js';
import { validateRestaurantRegistration } from '../validation/restaurant.Validation.js';

const router = express.Router();
const restaurantController = new RestaurantController();

// Existing Routes
router.post('/register', upload, validateRestaurantRegistration, restaurantController.registerRestaurant);
router.get('/:id', restaurantController.getRestaurantById);
router.patch('/:id', restaurantController.updateRestaurantStatus);

// New Routes
router.get('/', restaurantController.getAllRestaurants); // Get all restaurants
router.put('/:id', upload, restaurantController.updateRestaurant); // Update restaurant details
router.delete('/:id', restaurantController.deleteRestaurant); // Delete a restaurant

export default router;