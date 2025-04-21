const express = require('express');
const router = express.Router();

// Import controller functions
const { createOrder, getOrders, addToCart, getCart, deleteCartItem } = require('../controllers/orderController');

// Routes
router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.post('/cart/add', addToCart);
router.get('/cart/:userId', getCart);
router.delete('/cart/:userId/:itemId', deleteCartItem);

module.exports = router;