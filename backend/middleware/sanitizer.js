const { body, validationResult } = require('express-validator');

// Input sanitization middleware
const sanitizeInputs = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 2000); // Limit length
  };

  // Sanitize body fields
  if (req.body) {
    if (req.body.name) req.body.name = sanitizeString(req.body.name);
    if (req.body.email) req.body.email = sanitizeString(req.body.email).toLowerCase();
    if (req.body.content) req.body.content = sanitizeString(req.body.content);
    if (req.body.title) req.body.title = sanitizeString(req.body.title);
  }

  next();
};

// Validation middleware for public submissions
const validatePublicSubmission = [
  body('name').optional().trim().isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('content').optional().trim().isLength({ max: 2000 }).withMessage('Content cannot exceed 2000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('meta').optional().isObject().withMessage('Meta must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];

// File upload validation
const validateFileUpload = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Only images and videos are allowed.' 
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 50MB.' 
      });
    }
  }
  next();
};

module.exports = {
  sanitizeInputs,
  validatePublicSubmission,
  validateFileUpload
};
