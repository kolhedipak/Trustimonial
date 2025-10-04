const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  name: {
    type: String,
    required: [true, 'Space name is required'],
    trim: true,
    minlength: [3, 'Space name must be at least 3 characters'],
    maxlength: [60, 'Space name cannot exceed 60 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid logo URL format'
    }
  },
  headerTitle: {
    type: String,
    trim: true,
    maxlength: [80, 'Header title cannot exceed 80 characters']
  },
  headerMessage: {
    type: String,
    trim: true,
    maxlength: [300, 'Header message cannot exceed 300 characters']
  },
  questionList: {
    type: [String],
    required: [true, 'At least one question is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0 && v.every(q => q && q.trim().length > 0);
      },
      message: 'At least one non-empty question is required'
    }
  },
  collectExtras: [{
    type: String,
    enum: ['name', 'email', 'title', 'social']
  }],
  collectionType: {
    type: String,
    enum: ['text-only', 'text-and-star', 'text-and-video'],
    default: 'text-and-video'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'minimal'],
    default: 'light'
  },
  buttonColor: {
    type: String,
    default: '#00A676',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Button color must be a valid hex color'
    }
  },
  language: {
    type: String,
    default: 'en',
    maxlength: [2, 'Language code cannot exceed 2 characters']
  },
  autoTranslate: {
    type: Boolean,
    default: false
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  maxUses: {
    type: Number,
    min: [1, 'Max uses must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Max uses must be a whole number'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
spaceSchema.index({ ownerId: 1 });
spaceSchema.index({ isActive: 1 });

// Virtual for stats
spaceSchema.virtual('stats', {
  ref: 'Testimonial',
  localField: '_id',
  foreignField: 'spaceId',
  count: true
});

// Ensure virtual fields are serialized
spaceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Space', spaceSchema);
