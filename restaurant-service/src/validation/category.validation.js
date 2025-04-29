import { body, validationResult } from 'express-validator';

export const validateCategory = [
  // Name validation: required, string, trimmed, 3–50 characters
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Category name must be between 3 and 50 characters'),

  // Description validation: optional, string, trimmed, max 200 characters
  body('description')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Category description must not exceed 200 characters'),

  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    next();
  },
];