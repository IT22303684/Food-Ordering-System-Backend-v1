const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables first
dotenv.config();

// Log the MONGO_URI to verify it's being loaded
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware to parse JSON
app.use(express.json());

// Routes
const orderRoutes = require('./routes/order');
app.use('/api', orderRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Order Service is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});