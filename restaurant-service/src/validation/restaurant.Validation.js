import { body, validationResult } from 'express-validator';

// Common validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Restaurant registration validation rules
export const validateRestaurantRegistration = [
  body('restaurantName')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ min: 2 })
    .withMessage('Restaurant name must be at least 2 characters long'),

  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required')
    .isLength({ min: 2 })
    .withMessage('Contact person name must be at least 2 characters long'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
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
    .withMessage('Delivery radius is required')
    .matches(/^\d+(\.\d+)?\s*(km|mi)?$/)
    .withMessage('Delivery radius must be a valid number, optionally followed by "km" or "mi" (e.g., "5 km")'),

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
    .withMessage('Zip code is required')
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Please provide a valid zip code (e.g., 10100 or 10100-1234)'),

  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  body('agreeTerms')
    .isBoolean()
    .withMessage('Agree terms must be a boolean')
    .equals('true')
    .withMessage('You must agree to the terms and conditions'),

  body('businessLicense')
    .optional()
    .custom((value, { req }) => {
      if (req.files && !req.files.businessLicense) {
        return true;
      }
      return true;
    }),

  body('foodSafetyCert')
    .optional()
    .custom((value, { req }) => {
      if (req.files && !req.files.foodSafetyCert) {
        return true;
      }
      return true;
    }),

  body('exteriorPhoto')
    .optional()
    .custom((value, { req }) => {
      if (req.files && !req.files.exteriorPhoto) {
        return true;
      }
      return true;
    }),

  body('logo')
    .optional()
    .custom((value, { req }) => {
      if (req.files && !req.files.logo) {
        return true;
      }
      return true;
    }),

  validateRequest,
];