import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  items: [
    {
      menuItemId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: false,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    enum: [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ],
    default: "PENDING",
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  paymentMethod: {
    type: String,
    enum: ["CREDIT_CARD", "DEBIT_CARD", "CASH", "WALLET"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total price for each item and total amount before saving
orderSchema.pre("save", function (next) {
  // Calculate total price for each item
  this.items.forEach((item) => {
    item.totalPrice = item.price * item.quantity;
  });

  // Calculate total amount
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  // Update timestamp
  this.updatedAt = Date.now();
  next();
});

export const Order = mongoose.model("Order", orderSchema);
