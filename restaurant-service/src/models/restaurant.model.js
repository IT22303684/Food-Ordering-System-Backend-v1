import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  businessType: { type: String, required: true },
  cuisineType: { type: String, required: true },
  operatingHours: { type: String, required: true },
  deliveryRadius: { type: String, required: true },
  taxId: { type: String, required: true },
  address: {
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  agreeTerms: { type: Boolean, required: true },
  businessLicense: { type: String }, // Cloudinary URL
  foodSafetyCert: { type: String }, // Cloudinary URL
  exteriorPhoto: { type: String }, // Cloudinary URL
  logo: { type: String }, // Cloudinary URL
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
