import express, { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateRestaurantRegistration, validateUpdateAvailability } from '../validation/restaurant.validation.js';

const router = express.Router();
const restaurantController = new RestaurantController();

// Middleware to check if user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    const error = new Error('Unauthorized: Admins only');
    error.statusCode = 403;
    throw error;
  }
  next();
};

// Public route - MUST be before dynamic routes like /:id
router.get('/all', restaurantController.getAllRestaurants);
router.get('/:id',  restaurantController.getRestaurantById);

// Protected routes
router.post('/register', upload, validateRestaurantRegistration, restaurantController.registerRestaurant);
router.get('/', authMiddleware, restaurantController.getRestaurantByUserId);
router.patch('/availability', authMiddleware, validateUpdateAvailability, restaurantController.updateRestaurantAvailability );
router.patch('/:id', authMiddleware, adminMiddleware, restaurantController.updateRestaurantStatus);
router.put('/:id', authMiddleware, upload, restaurantController.updateRestaurant);
router.delete('/:id', authMiddleware, adminMiddleware, restaurantController.deleteRestaurant);

export default router;