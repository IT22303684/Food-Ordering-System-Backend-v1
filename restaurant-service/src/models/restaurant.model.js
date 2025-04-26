import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true }
});

const restaurantSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    unique: true 
  },
  restaurantName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  businessType: { type: String, required: true },
  cuisineType: { type: String, required: true },
  operatingHours: { type: String, required: true },
  deliveryRadius: { type: String, required: true },
  taxId: { type: String, required: true },
  address: { type: addressSchema, required: true },
  email: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'blocked'], 
    default: 'pending' 
  },
  agreeTerms: { type: Boolean, required: true },
  businessLicense: { type: String },
  foodSafetyCert: { type: String },
  exteriorPhoto: { type: String },
  logo: { type: String },
  availability: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Restaurant', restaurantSchema);