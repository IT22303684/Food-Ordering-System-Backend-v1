import express from 'express';
import { RestaurantController } from '../controllers/restaurant.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateRestaurantRegistration } from '../validation/restaurant.validation.js';

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

router.post('/register', upload, validateRestaurantRegistration, restaurantController.registerRestaurant);
router.get('/:id', authMiddleware, restaurantController.getRestaurantById);
router.get('/', authMiddleware, restaurantController.getRestaurantByUserId); // Keep only this for GET /api/restaurants
router.patch('/:id', authMiddleware, adminMiddleware, restaurantController.updateRestaurantStatus);
router.put('/:id', authMiddleware, upload, restaurantController.updateRestaurant);
router.delete('/:id', authMiddleware, restaurantController.deleteRestaurant);

export default router;