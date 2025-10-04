const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Space ID is required']
  },
  type: {
    type: String,
    enum: ['video', 'text', 'linked'],
    required: [true, 'Testimonial type is required']
  },
  authorName: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  authorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  mediaUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid media URL format'
    }
  },
  thumbnailUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid thumbnail URL format'
    }
  },
  collectedVia: {
    type: String,
    enum: ['link', 'embed', 'import', 'social'],
    default: 'link'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived', 'spam', 'deleted'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sourceLink: {
    type: String,
    trim: true
  },
  questionResponses: [{
    questionIndex: {
      type: Number,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true,
      maxlength: [2000, 'Answer cannot exceed 2000 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: function(v) {
          return v === null || v === undefined || Number.isInteger(v);
        },
        message: 'Rating must be a whole number'
      }
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
testimonialSchema.index({ spaceId: 1, status: 1 });
testimonialSchema.index({ spaceId: 1, type: 1 });
testimonialSchema.index({ status: 1, submittedAt: -1 });
testimonialSchema.index({ createdBy: 1 });
testimonialSchema.index({ sourceLink: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
