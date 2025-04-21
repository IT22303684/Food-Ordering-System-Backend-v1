const Order = require('../models/order');

const createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error creating order', error: error.message || error });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

const addToCart = async (req, res) => {
  try {
    const { userId, item } = req.body;
    let order = await Order.findOne({ userId, status: 'pending' });
    if (!order) {
      order = new Order({ userId, cart: [], total: 0, status: 'pending' });
    }
    order.cart.push(item);
    order.total = order.cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    await order.save();
    res.status(200).json(order.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const order = await Order.findOne({ userId, status: 'pending' });
    res.status(200).json(order ? order.cart : []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    let order = await Order.findOne({ userId, status: 'pending' });
    if (!order) return res.status(404).json({ message: 'Cart not found' });
    order.cart = order.cart.filter((item) => item.id !== parseInt(itemId));
    order.total = order.cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
    await order.save();
    res.status(200).json(order.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cart item', error });
  }
};

module.exports = { createOrder, getOrders, addToCart, getCart, deleteCartItem };