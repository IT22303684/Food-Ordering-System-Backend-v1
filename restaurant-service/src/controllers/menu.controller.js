import { MenuService } from '../services/menu.service.js';
import logger from '../utils/logger.js';

export class MenuController {
  constructor() {
    this.menuService = new MenuService();
    this.addMenuItem = this.addMenuItem.bind(this);
    this.getMenuItems = this.getMenuItems.bind(this);
    this.getMenuItemById = this.getMenuItemById.bind(this);
    this.updateMenuItem = this.updateMenuItem.bind(this);
    this.deleteMenuItem = this.deleteMenuItem.bind(this);
  }

  // add menu items
  async addMenuItem(req, res) {
    try {
      const { restaurantId } = req.params;
      logger.info('Adding menu item for restaurant:', { restaurantId });

      const menuItem = await this.menuService.addMenuItem(
        restaurantId,
        req.body,
        req.files,
        req.user.id
      );

      logger.info('Menu item added successfully:', { menuItemId: menuItem._id });

      res.status(201).json({
        message: 'Menu item added successfully',
        menuItem,
      });
    } catch (error) {
      logger.error('Add menu item error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error adding menu item' });
    }
  }

  // get menu items
  async getMenuItems(req, res) {
    try {
      const { restaurantId } = req.params;
      logger.info('Fetching menu items for restaurant:', { restaurantId });

      const menuItems = await this.menuService.getMenuItems(restaurantId, req.user?.id);

      logger.info('Menu items fetched successfully:', { restaurantId });

      res.status(200).json(menuItems);
    } catch (error) {
      logger.error('Get menu items error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching menu items' });
    }
  }

  // fetch a specific menu item by ID
  async getMenuItemById(req, res) {
    try {
      const { restaurantId, menuItemId } = req.params;
      logger.info('Fetching menu item:', { restaurantId, menuItemId });

      const menuItem = await this.menuService.getMenuItemById(restaurantId, menuItemId);

      logger.info('Menu item fetched successfully:', { restaurantId, menuItemId });

      res.status(200).json(menuItem);
    } catch (error) {
      logger.error('Get menu item error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error fetching menu item' });
    }
  }

  // update menu items
  async updateMenuItem(req, res) {
    try {
      const { menuItemId } = req.params;
      logger.info('Updating menu item:', { menuItemId });

      const updatedMenuItem = await this.menuService.updateMenuItem(
        menuItemId,
        req.body,
        req.files,
        req.user.id
      );

      logger.info('Menu item updated successfully:', { menuItemId });

      res.status(200).json({
        message: 'Menu item updated successfully',
        menuItem: updatedMenuItem,
      });
    } catch (error) {
      logger.error('Update menu item error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error updating menu item' });
    }
  }
  
  // delete menu item
  async deleteMenuItem(req, res) {
    try {
      const { menuItemId } = req.params;
      logger.info('Deleting menu item:', { menuItemId });

      await this.menuService.deleteMenuItem(menuItemId, req.user.id);

      logger.info('Menu item deleted successfully:', { menuItemId });

      res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      logger.error('Delete menu item error:', { message: error.message, stack: error.stack });
      if (error.isOperational) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting menu item' });
    }
  }
}