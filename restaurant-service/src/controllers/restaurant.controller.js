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
  }
  // register resturent
  async registerRestaurant(req, res) {
    try {
      const {
        restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
        deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms
      } = req.body;

      logger.info('Restaurant registration request received for:', { email });

      const { restaurant } = await this.restaurantService.registerRestaurant({
        restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
        deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms
      }, req.files);

      logger.info('Restaurant registration successful for:', { email });

      res.status(201).json({
        message: 'Restaurant registration submitted. Awaiting admin approval.',
        restaurant: {
          id: restaurant._id,
          userId: restaurant.userId, // Include userId in the response (optional)
          email: restaurant.email,
          restaurantName: restaurant.restaurantName,
          status: restaurant.status
        }
      });
    } catch (error) {
      logger.error('Restaurant registration error:', error.message);
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
        return res.status(error.statusCode).json({
          message: error.message
        });
      }

      logger.error('Server error:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }

  // get Resturent by ID
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

  // get all resturents
  async getAllRestaurants(req, res) {
    try {
      logger.info('Fetching all restaurants');

      const restaurants = await this.restaurantService.getAllRestaurants();

      logger.info('Restaurants fetched successfully', { count: restaurants.length });

      res.status(200).json(restaurants);
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
}