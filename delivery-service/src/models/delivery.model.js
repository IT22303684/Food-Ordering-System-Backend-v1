import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order",
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Driver",
  },
  status: {
    type: String,
    enum: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
    default: "ASSIGNED",
  },
  customerLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  driverLocation: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for geospatial queries
deliverySchema.index({ customerLocation: "2dsphere" });
deliverySchema.index({ driverLocation: "2dsphere" });

// Update the updatedAt field before saving
deliverySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Delivery = mongoose.model("Delivery", deliverySchema);
