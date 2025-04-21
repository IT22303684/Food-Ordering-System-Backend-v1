import express from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateRestaurantRegistration } from '../validation/restaurant.validation.js';

const router = express.Router();
const restaurantController = new RestaurantController();

router.post('/register', upload, validateRestaurantRegistration, restaurantController.registerRestaurant);
router.get('/:id', authMiddleware, restaurantController.getRestaurantById);
router.patch('/:id', restaurantController.updateRestaurantStatus);
router.get('/', restaurantController.getAllRestaurants);
router.put('/:id', authMiddleware, upload, restaurantController.updateRestaurant);
router.delete('/:id', authMiddleware, restaurantController.deleteRestaurant);

export default router;