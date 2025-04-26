import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

// Index to enforce unique category names per restaurant
categorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);