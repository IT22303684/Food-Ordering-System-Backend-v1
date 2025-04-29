import Restaurant from '../models/restaurant.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs/promises';
import axios from 'axios';
import logger from '../utils/logger.js';
import { emailClient } from "./email.client.js";

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;

export class RestaurantService {

// register resturent
  async registerRestaurant(data, files) {
    const {
      restaurantName, contactPerson, phoneNumber, businessType, cuisineType, operatingHours,
      deliveryRadius, taxId, streetAddress, city, state, zipCode, country, email, password, agreeTerms, availability
    } = data;

    // Check if restaurant email already exists
    logger.info('Checking for existing restaurant with email:', { email });
    const existingRestaurant = await Restaurant.findOne({ email });
    if (existingRestaurant) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Register user in auth-service
    logger.info('Registering user in auth-service for email:', { email });
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
      const errorMessage = error.code === 'ECONNREFUSED'
        ? `Could not connect to auth-service at ${process.env.AUTH_SERVICE_URL}.`
        : error.response?.data?.message || error.message || 'Unknown error';
      
      logger.error('Error creating user in auth-service: ' + errorMessage, {
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });

      const authError = new Error(`Failed to create user in auth-service: ${errorMessage}`);
      authError.statusCode = error.response?.status || 503;
      authError.isOperational = true;
      throw authError;
    }

    // Step 3: Upload files to Cloudinary
    logger.info('Uploading files to Cloudinary', { files: Object.keys(files || {}) });
    let businessLicenseUrl, foodSafetyCertUrl, exteriorPhotoUrl, logoUrl;
    try {
      if (files?.businessLicense) {
        logger.debug('Uploading businessLicense to Cloudinary');
        businessLicenseUrl = await uploadToCloudinary(files.businessLicense[0].path);
        logger.debug('Deleting local businessLicense file');
        await fs.unlink(files.businessLicense[0].path);
      }
      if (files?.foodSafetyCert) {
        logger.debug('Uploading foodSafetyCert to Cloudinary');
        foodSafetyCertUrl = await uploadToCloudinary(files.foodSafetyCert[0].path);
        logger.debug('Deleting local foodSafetyCert file');
        await fs.unlink(files.foodSafetyCert[0].path);
      }
      if (files?.exteriorPhoto) {
        logger.debug('Uploading exteriorPhoto to Cloudinary');
        exteriorPhotoUrl = await uploadToCloudinary(files.exteriorPhoto[0].path);
        logger.debug('Deleting local exteriorPhoto file');
        await fs.unlink(files.exteriorPhoto[0].path);
      }
      if (files?.logo) {
        logger.debug('Uploading logo to Cloudinary');
        logoUrl = await uploadToCloudinary(files.logo[0].path);
        logger.debug('Deleting local logo file');
        await fs.unlink(files.logo[0].path);
      }
    } catch (error) {
      logger.error('Cloudinary upload or file cleanup failed:', {
        message: error.message,
        stack: error.stack,
        files: Object.keys(files || {})
      });
      const uploadError = new Error(`Cloudinary upload failed: ${error.message}`);
      uploadError.statusCode = 500;
      uploadError.isOperational = true;
      throw uploadError;
    }

    // Step 4: Create new restaurant
    logger.info('Creating new restaurant in database');
    const restaurant = new Restaurant({
      _id:userId,
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
      agreeTerms,
      businessLicense: businessLicenseUrl,
      foodSafetyCert: foodSafetyCertUrl,
      exteriorPhoto: exteriorPhotoUrl,
      logo: logoUrl,
      availability: availability !== undefined ? availability : true
    });

    try {
      await restaurant.save();
      logger.info('Restaurant saved successfully', { restaurantId: restaurant._id });
    } catch (error) {
      logger.error('Failed to save restaurant to database:', {
        message: error.message,
        stack: error.stack,
        restaurantData: {
          userId,
          restaurantName,
          email
        }
      });
      const dbError = new Error(`Failed to save restaurant: ${error.message}`);
      dbError.statusCode = 500;
      dbError.isOperational = true;
      throw dbError;
    }

    // Step 5: Notify admin via notification-service
    logger.info('Sending notification to admin');
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
        to: 'admin@example.com',
        type: 'email',
        subject: 'New Restaurant Registration',
        message: `A new restaurant (${restaurantName}) has registered and is awaiting your approval.`
      });
      logger.info('Notification sent successfully');
    } catch (err) {
      logger.error('Notification error:', {
        message: err.message,
        stack: err.stack
      });
    }

    return { restaurant };
  }
// get resturent by ID
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
 // Update restaurant status and send corresponding email
 async updateRestaurantStatus(id, status) {
  // Find the restaurant by ID
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    const error = new Error('Restaurant not found');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Update the status
  restaurant.status = status;
  const updatedRestaurant = await restaurant.save();
  logger.info(`Restaurant status updated to ${status} for ID: ${id}`);

  // Send email based on the new status
  let emailSent = false;
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!restaurant.email || !emailRegex.test(restaurant.email)) {
      logger.warn(`Invalid or missing email address for restaurant: ${id}, skipping email sending`);
    } else if (status === 'rejected') {
      await emailClient.sendRejectionEmail(restaurant.email);
      logger.info(`Rejection email sent to: ${restaurant.email}`);
      emailSent = true;
    } else if (status === 'approved') {
      await emailClient.sendApprovedEmail(restaurant.email);
      logger.info(`Approval email sent to: ${restaurant.email}`);
      emailSent = true;
    } else if (status === 'blocked') {
      await emailClient.sendBlockedEmail(restaurant.email);
      logger.info(`Blocked email sent to: ${restaurant.email}`);
      emailSent = true;
    } else {
      logger.warn(`No email configured for status: ${status}`);
    }
  } catch (emailError) {
    logger.error('Failed to send email for status:', {
      status,
      email: restaurant.email,
      message: emailError.message,
      stack: emailError.stack
    });
  }

  return { updatedRestaurant, emailSent };
}
// get all resturent
 async getAllRestaurants(page = 1, limit = 10) {
  // Convert page and limit to integers and ensure they are positive
  page = Math.max(1, parseInt(page, 10));
  limit = Math.max(1, parseInt(limit, 10));

  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;

  // Fetch paginated restaurants and total count
  const restaurantsPromise = Restaurant.find()
    .skip(skip)
    .limit(limit)
    .exec();

  const totalCountPromise = Restaurant.countDocuments().exec();

  // Execute both queries in parallel
  const [restaurants, totalCount] = await Promise.all([restaurantsPromise, totalCountPromise]);

  return {
    restaurants,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    pageSize: limit,
  };
 }
// update resturent
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

    await restaurant.save();
    return restaurant;
  }
// delete resturent
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
  // get restaurant by userId
  async getRestaurantByUserId(userId) {
    logger.info('Fetching restaurant by userId:', { userId });
    const restaurant = await Restaurant.findOne({ userId });
    if (!restaurant) {
      const error = new Error('Restaurant not found for this user');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }
    return restaurant;
  }

  // Update restaurant availability
  async updateRestaurantAvailability(id, availability) {
    logger.info('Updating restaurant availability resturent:', { id, availability });
    logger.info('meka thama id eka', { id });

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      const error = new Error('Restaurant not found');
      error.statusCode = 404;
      error.isOperational = true;
      throw error;
    }

    restaurant.availability = availability;
    try {
      await restaurant.save();
      logger.info('Restaurant availability updated successfully', { restaurantId: restaurant._id });
    } catch (error) {
      logger.error('Failed to update restaurant availability:', {
        message: error.message,
        stack: error.stack
      });
      const dbError = new Error('Error updating restaurant availability');
      dbError.statusCode = 500;
      dbError.isOperational = true;
      throw dbError;
    }

    return { restaurant };
  }
}

