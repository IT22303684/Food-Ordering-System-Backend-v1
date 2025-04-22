// payment-service/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Error:', err));

app.use('/payment', paymentRoutes);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Payment service running on port ${PORT}`);
});
