import mongoose from "mongoose";

const paymentItemSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  cartId: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: String,
    required: true,
  },
  items: [paymentItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["CREDIT_CARD", "DEBIT_CARD"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  payhereTransactionId: {
    type: String,
    required: false,
  },
  payhereStatusCode: {
    type: Number,
    required: false,
  },
  payhereStatusMessage: {
    type: String,
    required: false,
  },
  cardDetails: {
    maskedCardNumber: {
      type: String,
      required: false,
    },
    cardHolderName: {
      type: String,
      required: false,
    },
  },
  refundedAt: {
    type: Date,
    required: false,
  },
  refundReason: {
    type: String,
    required: false,
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

paymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const Payment = mongoose.model("Payment", paymentSchema);