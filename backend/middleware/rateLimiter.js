const rateLimit = require('express-rate-limit');

// Rate limiter for public submissions
const publicSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 submissions per windowMs
  message: {
    error: 'Too many submissions from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator to include slug
  keyGenerator: (req) => {
    return `${req.ip}-${req.params.slug || 'general'}`;
  }
});

// Rate limiter for share link creation
const shareLinkCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each user to 5 share links per hour
  message: {
    error: 'Too many share links created, please try again later.',
    retryAfter: 60 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Custom key generator to include user ID
  keyGenerator: (req) => {
    return `user-${req.user?._id || 'anonymous'}`;
  }
});

// Rate limiter for general API endpoints
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  publicSubmissionLimiter,
  shareLinkCreationLimiter,
  generalApiLimiter
};
