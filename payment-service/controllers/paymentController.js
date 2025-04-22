// controllers/paymentController.js
const Payment = require('../models/paymentModel');
const crypto = require('crypto');

const merchant_id = process.env.PAYHERE_MERCHANT_ID; // Set in your .env
const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET; // Set in your .env

// Helper to generate hash (for PayHere security)
function generateHash(order_id, amount, currency) {
  const hash = crypto.createHash('md5');
  const data = merchant_id + order_id + amount + currency + merchant_secret;
  hash.update(data);
  return hash.digest('hex').toUpperCase();
}

// Start payment
exports.startPayment = async (req, res) => {
  const { order_id, amount, currency, first_name, last_name, email, phone, address, city, country } = req.body;

  // Save payment to DB (optional)
  await Payment.create({ order_id, amount, currency });

  // Prepare PayHere payload
  const payload = {
    merchant_id,
    return_url: 'http://localhost:3000/payment/success',
    cancel_url: 'http://localhost:3000/payment/cancel',
    notify_url: 'http://your-public-domain.com/payment/notify', // Must be public for PayHere to notify
    order_id,
    items: 'Order Payment',
    amount,
    currency,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    country
    // hash: generateHash(order_id, amount, currency) // For advanced security, if needed
  };

  // Send payload to frontend or redirect user to PayHere
  res.json({ payhereUrl: 'https://sandbox.payhere.lk/pay/checkout', payload });
};

// Handle PayHere notifications
exports.handleNotification = async (req, res) => {
  const { order_id, payment_id, status_code } = req.body;
  // Validate signature here if needed

  // Update payment status in DB
  await Payment.findOneAndUpdate({ order_id }, { status: status_code, payment_id });

  res.send('Notification received');
};
