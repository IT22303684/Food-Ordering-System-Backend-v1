import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import Restaurant from '../models/restaurant.model.js'; // Use import instead of require

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      const error = new Error('No token provided');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Handle both `id` and `userId` in the token payload
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      const error = new Error('Invalid token: user ID not found');
      error.statusCode = 401;
      throw error;
    }
    req.user = { id: userId, role: decoded.role };

    if (req.params.id || req.query.userId) {
      const restaurantId = req.params.id;
      const userIdToCheck = req.query.userId || req.user.id;

      if (req.user.role === 'RESTAURANT' && req.query.userId && req.query.userId !== req.user.id) {
        const error = new Error('Unauthorized: Cannot access other restaurants');
        error.statusCode = 403;
        throw error;
      }

      if (restaurantId) {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
          const error = new Error('Restaurant not found');
          error.statusCode = 404;
          throw error;
        }
        if (req.user.role === 'RESTAURANT' && restaurant.userId.toString() !== req.user.id) {
          const error = new Error('Unauthorized: Not your restaurant');
          error.statusCode = 403;
          throw error;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', {
      message: error.message,
      stack: error.stack,
    });
    const statusCode = error.statusCode || 401;
    res.status(statusCode).json({ message: error.message });
  }
};