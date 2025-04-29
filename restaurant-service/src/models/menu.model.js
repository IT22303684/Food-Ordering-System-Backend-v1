import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  mainImage: { 
    type: String 
  }, // Cloudinary URL for main image
  thumbnailImage: { 
    type: String 
  }, // Cloudinary URL for thumbnail image
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);