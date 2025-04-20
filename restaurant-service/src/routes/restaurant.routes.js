import express from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import upload from '../middleware/upload.js';
import { validateRestaurantRegistration } from '../validation/restaurant.Validation.js';

const router = express.Router();
const restaurantController = new RestaurantController();

router.post('/register', upload, validateRestaurantRegistration, restaurantController.registerRestaurant);
router.get('/:id', restaurantController.getRestaurantById);
router.patch('/:id', restaurantController.updateRestaurantStatus);

export default router;