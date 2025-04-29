import { CategoryService } from '../services/category.service.js';
import logger from '../utils/logger.js';

export class CategoryController {
  constructor() {
    this.categoryService = new CategoryService();
    this.getCategories = this.getCategories.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
  }

  async getCategories(req, res) {
    try {
      const { restaurantId } = req.params;
      logger.info('Fetching categories for restaurant:', { restaurantId });

      const categories = await this.categoryService.getCategories(restaurantId, req.user.id);

      logger.info('Categories fetched successfully:', { restaurantId });

      res.status(200).json(categories);
    } catch (error) {
      logger.error('Get categories error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching categories' });
    }
  }

  async addCategory(req, res) {
    try {
      const { restaurantId } = req.params;
      logger.info('Adding category for restaurant:', { restaurantId });

      const category = await this.categoryService.addCategory(
        restaurantId,
        req.body,
        req.user.id
      );

      logger.info('Category added successfully:', { categoryId: category._id });

      res.status(201).json({
        message: 'Category added successfully',
        category,
      });
    } catch (error) {
      logger.error('Add category error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error adding category' });
    }
  }

  async updateCategory(req, res) {
    try {
      const { restaurantId, categoryId } = req.params;
      logger.info('Updating category:', { restaurantId, categoryId });

      const updatedCategory = await this.categoryService.updateCategory(
        restaurantId,
        categoryId,
        req.body,
        req.user.id
      );

      logger.info('Category updated successfully:', { categoryId });

      res.status(200).json({
        message: 'Category updated successfully',
        category: updatedCategory,
      });
    } catch (error) {
      logger.error('Update category error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating category' });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { restaurantId, categoryId } = req.params;
      logger.info('Deleting category:', { restaurantId, categoryId });

      await this.categoryService.deleteCategory(restaurantId, categoryId, req.user.id);

      logger.info('Category deleted successfully:', { categoryId });

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      logger.error('Delete category error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting category' });
    }
  }
  async getCategoryById(req, res) {
    try {
      const { restaurantId, categoryId } = req.params;
      logger.info(`Fetching category ${categoryId} for restaurant ${restaurantId}`);
      const category = await this.categoryService.getCategoryById(restaurantId, categoryId);
      res.status(200).json({
        success: true,
        data: category,
        message: 'Category retrieved successfully',
      });
    } catch (error) {
      logger.error('Get category by ID controller error:', error);
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Failed to fetch category',
      });
    }
  }
}