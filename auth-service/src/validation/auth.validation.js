import { body, validationResult } from "express-validator";

// Common validation middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
export const userValidationRules = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Login validation rules
export const loginValidationRules = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Password reset validation rules
export const passwordResetValidationRules = [
  body("email").isEmail().withMessage("Please provide a valid email"),
];

// New password validation rules
export const newPasswordValidationRules = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("token").notEmpty().withMessage("Token is required"),
];

// Registration validation
export const validateRegistration = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number"),

  body("role")
    .optional()
    .isIn(["CUSTOMER", "RESTAURANT", "DELIVERY", "ADMIN"])
    .withMessage("Invalid role specified"),

  validateRequest,
];

// Login validation
export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  validateRequest,
];

// Email verification validation
export const validateEmailVerification = [
  body("pin")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("PIN must be 6 digits")
    .matches(/^\d+$/)
    .withMessage("PIN must contain only numbers"),

  validateRequest,
];

// Password reset request validation
export const validateForgotPassword = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  validateRequest,
];

// Password reset validation
export const validateResetPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  validateRequest,
];

// Update profile validation
export const validateProfileUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number"),

  validateRequest,
];

// Change password validation
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("confirmNewPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("New passwords do not match");
    }
    return true;
  }),

  validateRequest,
];

// Update user validation (for admin)
export const validateUpdateUser = [
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Please provide a valid phone number"),
  body("role")
    .optional()
    .isIn(["CUSTOMER", "RESTAURANT", "DELIVERY", "ADMIN"])
    .withMessage("Invalid role specified"),
  body("address.street")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("address.city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("address.state")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("address.zipCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Zip code is required"),
  body("address.country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("confirmPassword")
    .optional()
    .custom((value, { req }) => {
      if (req.body.password && value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  validateRequest,
];

// Update user status validation (for admin)
export const validateUpdateUserStatus = [
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("isVerified")
    .optional()
    .isBoolean()
    .withMessage("isVerified must be a boolean"),
  validateRequest,
];

// Update user role validation (for admin)
export const validateUpdateUserRole = [
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["CUSTOMER", "RESTAURANT", "DELIVERY", "ADMIN"])
    .withMessage("Invalid role specified"),
  validateRequest,
];
