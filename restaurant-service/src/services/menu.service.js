import MenuItem from '../models/menu.model.js';
import Restaurant from '../models/restaurant.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

export class MenuService {

  // add menu items
  async addMenuItem(restaurantId, data, files, userId) {
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

    let mainImageUrl, thumbnailImageUrl;
    try {
      if (files?.mainImage) {
        mainImageUrl = await uploadToCloudinary(files.mainImage[0].path);
        await fs.unlink(files.mainImage[0].path);
      }
      if (files?.thumbnailImage) {
        thumbnailImageUrl = await uploadToCloudinary(files.thumbnailImage[0].path);
        await fs.unlink(files.thumbnailImage[0].path);
      }
    } catch (error) {
      const uploadError = new Error(`Cloudinary upload failed: ${error.message}`);
      uploadError.statusCode = 500;
      uploadError.isOperational = true;
      throw uploadError;
    }

    const menuItem = new MenuItem({
      restaurantId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      mainImage: mainImageUrl,
      thumbnailImage: thumbnailImageUrl,
      isAvailable: data.isAvailable ?? true,
    });

    await menuItem.save();
    return menuItem;
  }

  // get mmenu items by resturent
  async getMenuItems(restaurantId, userId = null) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    // Skip ownership check if userId is not provided (public route)
    if (userId && restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const menuItems = await MenuItem.find({ restaurantId });
    return menuItems;
  }

  // fetch a specific menu item by ID
  async getMenuItemById(restaurantId, menuItemId) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const menuItem = await MenuItem.findOne({ _id: menuItemId, restaurantId });
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    return menuItem;
  }

  // update menu item
  async updateMenuItem(menuItemId, data, files, userId) {
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    if (data.name) menuItem.name = data.name;
    if (data.description) menuItem.description = data.description;
    if (data.price) menuItem.price = data.price;
    if (data.category) menuItem.category = data.category;
    if (data.isAvailable !== undefined) menuItem.isAvailable = data.isAvailable;

    let mainImageUrl, thumbnailImageUrl;
    try {
      if (files?.mainImage) {
        mainImageUrl = await uploadToCloudinary(files.mainImage[0].path);
        await fs.unlink(files.mainImage[0].path);
        menuItem.mainImage = mainImageUrl;
      }
      if (files?.thumbnailImage) {
        thumbnailImageUrl = await uploadToCloudinary(files.thumbnailImage[0].path);
        await fs.unlink(files.thumbnailImage[0].path);
        menuItem.thumbnailImage = thumbnailImageUrl;
      }
    } catch (error) {
      const uploadError = new Error(`Cloudinary upload failed: ${error.message}`);
      uploadError.statusCode = 500;
      uploadError.isOperational = true;
      throw uploadError;
    }

    await menuItem.save();
    return menuItem;
  }

  // delete menu item
  async deleteMenuItem(menuItemId, userId) {
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      const error = new Error('Menu item not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (restaurant.userId.toString() !== userId) {
      const error = new Error('Access denied: You do not own this restaurant');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    await menuItem.deleteOne();
    return { message: 'Menu item deleted successfully' };
  }
}