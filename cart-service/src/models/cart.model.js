import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
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
    mainImage: {
      type: String,
      required: true,
      default: "",
    },
    thumbnailImage: {
      type: String,
      required: true,
      default: "",
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  restaurantId: {
    type: String,
    required: function () {
      return this.items && this.items.length > 0;
    },
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
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

// Update the updatedAt timestamp before saving
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );
  next();
});

// Validate image fields before saving
cartSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      if (!item.mainImage) {
        item.mainImage = "";
      }
      if (!item.thumbnailImage) {
        item.thumbnailImage = "";
      }
    });
  }
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
