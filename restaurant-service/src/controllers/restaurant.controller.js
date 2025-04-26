import { RestaurantService } from '../services/restaurant.service.js';
import logger from '../utils/logger.js';

export class RestaurantController {
  constructor() {
    this.restaurantService = new RestaurantService();
    this.registerRestaurant = this.registerRestaurant.bind(this);
    this.getRestaurantById = this.getRestaurantById.bind(this);
    this.updateRestaurantStatus = this.updateRestaurantStatus.bind(this);
    this.getAllRestaurants = this.getAllRestaurants.bind(this);
    this.updateRestaurant = this.updateRestaurant.bind(this);
    this.deleteRestaurant = this.deleteRestaurant.bind(this);
    this.getRestaurantByUserId = this.getRestaurantByUserId.bind(this);
    this.updateRestaurantAvailability = this.updateRestaurantAvailability.bind(this);
  }
  // register resturent
  async registerRestaurant(req, res) {
    try {
      const {
        restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
        deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms, availability
      } = req.body;

      logger.info('Restaurant registration request received for:', { email });

      const { restaurant } = await this.restaurantService.registerRestaurant({
        restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
        deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms, availability
      }, req.files);

      logger.info('Restaurant registration successful for:', { email });

      res.status(201).json({
        message: 'Restaurant registration submitted. Awaiting admin approval.',
        restaurant: {
          id: restaurant._id,
          userId: restaurant.userId,
          email: restaurant.email,
          restaurantName: restaurant.restaurantName,
          status: restaurant.status,
          availability: restaurant.availability
        }
      });
    } catch (error) {
      logger.error('Restaurant registration error:', {
        message: error.message,
        stack: error.stack,
        requestBody: req.body.email
      });

      if (error.name === 'ValidationError') {
        logger.error('Validation errors:', Object.values(error.errors).map(err => err.message));
        return res.status(400).json({
          message: 'Invalid data',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      if (error.isOperational) {
        logger.error('Operational error:', error.message);
        return res.status(error.statusCode).json({
          message: error.message
        });
      }

      logger.error('Server error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }
  // get resturent by ID
  async getRestaurantById(req, res) {
    try {
      logger.info('Fetching restaurant by ID:', { id: req.params.id });

      const restaurant = await this.restaurantService.getRestaurantById(req.params.id);

      logger.info('Restaurant fetched successfully:', { id: req.params.id });

      res.status(200).json(restaurant);
    } catch (error) {
      logger.error('Get restaurant error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error fetching restaurant' });
    }
  }
  // update resturent status
  async updateRestaurantStatus(req, res) {
    try {
      const { status } = req.body;
      logger.info('Updating restaurant status:', { id: req.params.id, status });

      await this.restaurantService.updateRestaurantStatus(req.params.id, status);

      logger.info('Restaurant status updated successfully:', { id: req.params.id, status });

      res.status(200).json({ message: 'Restaurant status updated' });
    } catch (error) {
      logger.error('Update restaurant status error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error updating restaurant status' });
    }
  }
  // get all resturent
  async getAllRestaurants(req, res) {
    try {
      logger.info('Fetching all restaurants');
  
      // Extract page and limit from query parameters (default to 1 and 10)
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
  
      const result = await this.restaurantService.getAllRestaurants(page, limit);
  
      logger.info('Restaurants fetched successfully', {
        count: result.restaurants.length,
        totalCount: result.totalCount,
        page: result.currentPage,
        totalPages: result.totalPages,
      });
  
      res.status(200).json({
        success: true,
        data: result.restaurants,
        pagination: {
          totalCount: result.totalCount,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          pageSize: result.pageSize,
        },
      });
    } catch (error) {
      logger.error('Get all restaurants error:', error.message);
      logger.error('Error stack trace:', error.stack);
  
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
  
      res.status(500).json({ message: 'Error fetching restaurants' });
    }
  }
  // update resturent
  async updateRestaurant(req, res) {
    try {
      const { id } = req.params;
      logger.info('Updating restaurant:', { id });

      const updatedRestaurant = await this.restaurantService.updateRestaurant(id, req.body, req.files);

      logger.info('Restaurant updated successfully:', { id });

      res.status(200).json({
        message: 'Restaurant updated successfully',
        restaurant: updatedRestaurant
      });
    } catch (error) {
      logger.error('Update restaurant error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.name === 'ValidationError') {
        logger.error('Validation errors:', Object.values(error.errors).map(err => err.message));
        return res.status(400).json({
          message: 'Invalid data',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      if (error.isOperational) {
        logger.error('Operational error:', error.message);
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error updating restaurant' });
    }
  }
  // delete resturent
  async deleteRestaurant(req, res) {
    try {
      const { id } = req.params;
      logger.info('Deleting restaurant:', { id });

      await this.restaurantService.deleteRestaurant(id);

      logger.info('Restaurant deleted successfully:', { id });

      res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      logger.error('Delete restaurant error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error deleting restaurant' });
    }
  }
  // get resturent by userId
  async getRestaurantByUserId(req, res) {
    try {
      const userId = req.query.userId || req.user.id; // Use req.user.id from JWT if query parameter is not provided
      if (!userId) {
        const error = new Error('User ID not provided');
        error.statusCode = 400;
        throw error;
      }

      logger.info('Fetching restaurant by userId:', { userId });

      const restaurant = await this.restaurantService.getRestaurantByUserId(userId);

      logger.info('Restaurant fetched successfully by userId:', { userId });

      res.status(200).json(restaurant);
    } catch (error) {
      logger.error('Get restaurant by userId error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error fetching restaurant' });
    }
  }
  // Update restaurant availability
  async updateRestaurantAvailability(req, res) {
    try {
      const { availability } = req.body;
      const userId = req.user.id; // From authMiddleware

      logger.info('Updating restaurant availability:', { userId, availability });

      const { restaurant } = await this.restaurantService.updateRestaurantAvailability(userId, availability);

      logger.info('Restaurant availability updated successfully:', { userId, availability });

      res.status(200).json({
        message: 'Restaurant availability updated',
        restaurant: {
          id: restaurant._id,
          restaurantName: restaurant.restaurantName,
          availability: restaurant.availability
        }
      });
    } catch (error) {
      logger.error('Update restaurant availability error:', error.message);
      logger.error('Error stack trace:', error.stack);

      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      res.status(500).json({ message: 'Error updating restaurant availability' });
    }
  }
}
