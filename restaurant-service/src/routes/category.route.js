import express from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateCategory } from '../validation/category.validation.js';

const router = express.Router();
const categoryController = new CategoryController();


router.get('/:restaurantId/categories', authMiddleware, categoryController.getCategories);
router.post('/:restaurantId/categories', authMiddleware, validateCategory, categoryController.addCategory);
router.patch('/:restaurantId/categories/:categoryId', authMiddleware, validateCategory, categoryController.updateCategory);
router.delete('/:restaurantId/categories/:categoryId', authMiddleware, categoryController.deleteCategory);

router.get('/:restaurantId/categories/:categoryId', categoryController.getCategoryById);

export default router;