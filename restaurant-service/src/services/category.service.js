import Category from '../models/category.model.js';
import Restaurant from '../models/restaurant.model.js';
import MenuItem from '../models/menu.model.js';
import logger from '../utils/logger.js';

export class CategoryService {
  async getCategories(restaurantId, userId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const categories = await Category.find({ restaurantId });
    return categories;
  }

  async addCategory(restaurantId, data, userId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const category = new Category({
      restaurantId,
      name: data.name,
      description: data.description, // Added
    });

    await category.save();
    return category;
  }

  async updateCategory(restaurantId, categoryId, data, userId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const category = await Category.findOne({ _id: categoryId, restaurantId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (data.name) category.name = data.name;
    if (data.description !== undefined) category.description = data.description; // Added

    await category.save();
    return category;
  }

  async deleteCategory(restaurantId, categoryId, userId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const category = await Category.findOne({ _id: categoryId, restaurantId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const menuItems = await MenuItem.find({ category: categoryId });
    if (menuItems.length > 0) {
      const error = new Error('Cannot delete category: It is used by menu items');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    await category.deleteOne();
    return { message: 'Category deleted successfully' };
  }

  // get category by id 
  async getCategoryById(restaurantId, categoryId) {
    logger.info(`Fetching category ${categoryId} for restaurant ${restaurantId}`);

    // Validate restaurant existence
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Fetch category
    const category = await Category.findOne({ _id: categoryId, restaurantId });
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    logger.info(`Category ${categoryId} retrieved successfully`);
    return category;
  }
}