import Restaurant from '../models/restaurant.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import axios from 'axios';

export class RestaurantService {
  async registerRestaurant(data, files) {
    const {
      restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
      deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms
    } = data;

    // Check if restaurant email already exists
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload files to Cloudinary
    let businessLicenseUrl, foodSafetyCertUrl, exteriorPhotoUrl, logoUrl;
    try {
      if (files?.businessLicense) {
        businessLicenseUrl = await uploadToCloudinary(files.businessLicense[0].path);
        await fs.unlink(files.businessLicense[0].path);
      }
      if (files?.foodSafetyCert) {
        foodSafetyCertUrl = await uploadToCloudinary(files.foodSafetyCert[0].path);
        await fs.unlink(files.foodSafetyCert[0].path);
      }
      if (files?.exteriorPhoto) {
        exteriorPhotoUrl = await uploadToCloudinary(files.exteriorPhoto[0].path);
        await fs.unlink(files.exteriorPhoto[0].path);
      }
      if (files?.logo) {
        logoUrl = await uploadToCloudinary(files.logo[0].path);
        await fs.unlink(files.logo[0].path);
      }
    } catch (error) {
      const uploadError = new Error(`Cloudinary upload failed: ${error.message}`);
      uploadError.statusCode = 500;
      uploadError.isOperational = true;
      throw uploadError;
    }

    // Create new restaurant
    const restaurant = new Restaurant({
      restaurantName,
      contactPerson,
      phoneNumber,
      businessType,
      cuisineType,
      operatingHours,
      deliveryRadius,
      taxId,
      address: { streetAddress, city, state, zipCode, country },
      email,
      password: hashedPassword,
      agreeTerms,
      businessLicense: businessLicenseUrl,
      foodSafetyCert: foodSafetyCertUrl,
      exteriorPhoto: exteriorPhotoUrl,
      logo: logoUrl
    });

    await restaurant.save();

    // Notify admin via notification-service
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
        to: 'admin@example.com',
        type: 'email',
        subject: 'New Restaurant Registration',
        message: `A new restaurant (${restaurantName}) has registered and is awaiting your approval.`
      });
    } catch (err) {
      console.error('Notification error:', err.message);
      // Not throwing an error here to ensure registration completes even if notification fails
    }

    return { restaurant };
  }

  async getRestaurantById(id) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return restaurant;
  }

  async updateRestaurantStatus(id, status) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    restaurant.status = status;
    await restaurant.save();
    return restaurant;
  }
}