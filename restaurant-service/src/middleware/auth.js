import axios from 'axios';
import logger from '../utils/logger.js';
import Restaurant from '../models/restaurant.model.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token with auth-service
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/verify`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.success) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = response.data.user;
    if (user.role !== 'RESTAURANT') {
      return res.status(403).json({ message: 'Access denied: Not a restaurant owner' });
    }

    // Attach user to request
    req.user = user;

    // Check if the user owns the restaurant (for routes with :id)
    if (req.params.id) {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: 'Restaurant not found' });
      }
      if (restaurant.userId.toString() !== user.id) {
        return res.status(403).json({ message: 'Access denied: You do not own this restaurant' });
      }
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(500).json({ message: 'Authentication failed' });
  }
};