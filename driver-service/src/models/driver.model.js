import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  currentDelivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Delivery",
    default: null,
  },
  location: {
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
  vehicleType: {
    type: String,
    enum: ["BIKE", "SCOOTER", "CAR"],
    required: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  totalDeliveries: {
    type: Number,
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

// Create index for geospatial queries
driverSchema.index({ location: "2dsphere" });

// Update the updatedAt field before saving
driverSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const Driver = mongoose.model("Driver", driverSchema);
