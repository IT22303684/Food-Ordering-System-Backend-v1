import Restaurant from '../models/restaurant.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import axios from 'axios';
import logger from '../utils/logger.js';

export class RestaurantService {
  async registerRestaurant(data, files) {
    const {
      restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
      deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms
    } = data;

    // Step 1: Check if restaurant email already exists in restaurant-service
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Step 2: Register the user in auth-service with RESTAURANT role
    let userId;
    try {
      const authResponse = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/register`, {
        email,
        password,
        role: 'RESTAURANT',
        firstName: contactPerson,
        lastName: restaurantName,
        address: {
          street: streetAddress,
          city,
          state,
          zipCode,
          country
        }
      });

      if (authResponse.status !== 201) {
        throw new Error('Failed to create user in auth-service');
      }

      userId = authResponse.data.user.id;
      logger.info('User created in auth-service', { userId, email });

      logger.warn(
        'User created but not verified. To allow login, manually set isVerified: true in the auth-service database.',
        { userId, email }
      );
    } catch (error) {
      // Improved error handling to capture specific error messages
      const errorMessage = error.code === 'ECONNREFUSED'
        ? `Could not connect to auth-service at ${process.env.AUTH_SERVICE_URL}. Please ensure auth-service is running on port 3002.`
        : error.response?.data?.message || error.message || 'Unknown error';
      
      logger.error('Error creating user in auth-service: ' + errorMessage, {
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
        code: error.code,
        config: error.config
      });

      const authError = new Error(`Failed to create user in auth-service: ${errorMessage}`);
      authError.statusCode = error.response?.status || 503; // Use 503 Service Unavailable for connection issues
      authError.isOperational = true;
      throw authError;
    }

    // Step 3: Upload files to Cloudinary
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

    // Step 4: Create new restaurant with the userId
    const restaurant = new Restaurant({
      userId,
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
      password,
      agreeTerms,
      businessLicense: businessLicenseUrl,
      foodSafetyCert: foodSafetyCertUrl,
      exteriorPhoto: exteriorPhotoUrl,
      logo: logoUrl
    });

    await restaurant.save();

    // Step 5: Notify admin via notification-service
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
        to: 'admin@example.com',
        type: 'email',
        subject: 'New Restaurant Registration',
        message: `A new restaurant (${restaurantName}) has registered and is awaiting your approval.`
      });
    } catch (err) {
      logger.error('Notification error:', err.message);
    }

    return { restaurant };
  }

  async getRestaurantById(id) {
    const restaurant = await Restaurant.findById(id).select('-password');
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

  async getAllRestaurants() {
    const restaurants = await Restaurant.find().select('-password');
    return restaurants;
  }

  async updateRestaurant(id, data, files) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    const {
      restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
      deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email
    } = data;

    if (restaurantName) restaurant.restaurantName = restaurantName;
    if (contactPerson) restaurant.contactPerson = contactPerson;
    if (phoneNumber) restaurant.phoneNumber = phoneNumber;
    if (businessType) restaurant.businessType = businessType;
    if (cuisineType) restaurant.cuisineType = cuisineType;
    if (operatingHours) restaurant.operatingHours = operatingHours;
    if (deliveryRadius) restaurant.deliveryRadius = deliveryRadius;
    if (taxId) restaurant.taxId = taxId;
    if (streetAddress) restaurant.address.streetAddress = streetAddress;
    if (city) restaurant.address.city = city;
    if (state) restaurant.address.state = state;
    if (zipCode) restaurant.address.zipCode = zipCode;
    if (country) restaurant.address.country = country;
    if (email && email !== restaurant.email) {
      const existingRestaurant = await Restaurant.findOne({ email });
      if (existingRestaurant) {
        const error = new Error('Email already registered');
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      restaurant.email = email;
    }

    let businessLicenseUrl, foodSafetyCertUrl, exteriorPhotoUrl, logoUrl;
    try {
      if (files?.businessLicense) {
        businessLicenseUrl = await uploadToCloudinary(files.businessLicense[0].path);
        await fs.unlink(files.businessLicense[0].path);
        restaurant.businessLicense = businessLicenseUrl;
      }
      if (files?.foodSafetyCert) {
        foodSafetyCertUrl = await uploadToCloudinary(files.foodSafetyCert[0].path);
        await fs.unlink(files.foodSafetyCert[0].path);
        restaurant.foodSafetyCert = foodSafetyCertUrl;
      }
      if (files?.exteriorPhoto) {
        exteriorPhotoUrl = await uploadToCloudinary(files.exteriorPhoto[0].path);
        await fs.unlink(files.exteriorPhoto[0].path);
        restaurant.exteriorPhoto = exteriorPhotoUrl;
      }
      if (files?.logo) {
        logoUrl = await uploadToCloudinary(files.logo[0].path);
        await fs.unlink(files.logo[0].path);
        restaurant.logo = logoUrl;
      }
    } catch (error) {
      const uploadError = new Error(`Cloudinary upload failed: ${error.message}`);
      uploadError.statusCode = 500;
      uploadError.isOperational = true;
      throw uploadError;
    }

    await restaurant.save();
    return restaurant;
  }

  async deleteRestaurant(id) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    await restaurant.deleteOne();
    return { message: 'Restaurant deleted successfully' };
  }
}