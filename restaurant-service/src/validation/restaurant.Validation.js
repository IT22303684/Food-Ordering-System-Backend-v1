import { body } from 'express-validator';

export const validateRestaurantRegistration = [
  body('restaurantName')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required'),
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person is required'),
  body('phoneNumber')
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('businessType')
    .trim()
    .notEmpty()
    .withMessage('Business type is required'),
  body('cuisineType')
    .trim()
    .notEmpty()
    .withMessage('Cuisine type is required'),
  body('operatingHours')
    .trim()
    .notEmpty()
    .withMessage('Operating hours are required'),
  body('deliveryRadius')
    .trim()
    .notEmpty()
    .withMessage('Delivery radius is required'),
  body('taxId')
    .trim()
    .notEmpty()
    .withMessage('Tax ID is required'),
  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('agreeTerms')
    .equals('true')
    .withMessage('You must agree to the terms and conditions'),
  body('availability')
    .optional()
    .isBoolean()
    .withMessage('Availability must be a boolean')
];

// Update restaurant availability
export const validateUpdateAvailability = [
  body('availability')
    .isBoolean()
    .withMessage('Availability must be a boolean')
];