import express from 'express';
import { MenuController } from '../controllers/menu.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateMenuItem } from '../validation/menu.validation.js';

const router = express.Router();
const menuController = new MenuController();

// Public route
router.get('/:restaurantId/menu-items', menuController.getMenuItems);
router.get('/:restaurantId/menu-items/:menuItemId', menuController.getMenuItemById);

// Private routes
router.post('/:restaurantId/menu-items', authMiddleware, upload, validateMenuItem, menuController.addMenuItem);
router.patch('/:restaurantId/menu-items/:menuItemId', authMiddleware, upload, validateMenuItem, menuController.updateMenuItem);
router.delete('/:restaurantId/menu-items/:menuItemId', authMiddleware, menuController.deleteMenuItem);

export default router;