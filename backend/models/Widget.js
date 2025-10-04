const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: [true, 'Space ID is required']
  },
  name: {
    type: String,
    required: [true, 'Widget name is required'],
    trim: true,
    maxlength: [60, 'Widget name cannot exceed 60 characters']
  },
  type: {
    type: String,
    enum: ['wall', 'single'],
    required: [true, 'Widget type is required']
  },
  designTemplate: {
    type: String,
    required: [true, 'Design template is required']
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Widget settings are required'],
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
widgetSchema.index({ spaceId: 1, status: 1 });
widgetSchema.index({ spaceId: 1, type: 1 });
widgetSchema.index({ createdBy: 1 });

// Validation for settings based on widget type
widgetSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('settings')) {
    // Validate settings based on widget type
    if (this.type === 'wall') {
      this.validateWallSettings();
    } else if (this.type === 'single') {
      this.validateSingleSettings();
    }
  }
  next();
});

widgetSchema.methods.validateWallSettings = function() {
  const settings = this.settings;
  
  // Required fields for wall widgets
  if (!settings.designTemplate || !['grid-cards', 'masonry', 'carousel'].includes(settings.designTemplate)) {
    throw new Error('Invalid design template for wall widget');
  }
  
  if (!settings.theme || !['light', 'dark', 'minimal'].includes(settings.theme)) {
    throw new Error('Invalid theme for wall widget');
  }
  
  if (settings.itemsToShow && (settings.itemsToShow < 1 || settings.itemsToShow > 50)) {
    throw new Error('Items to show must be between 1 and 50');
  }
  
  if (settings.sortOrder && !['newest', 'highest_rating', 'random'].includes(settings.sortOrder)) {
    throw new Error('Invalid sort order for wall widget');
  }
};

widgetSchema.methods.validateSingleSettings = function() {
  const settings = this.settings;
  
  // Required fields for single widgets
  if (!settings.designTemplate || !['card-compact', 'hero', 'quote-overlay'].includes(settings.designTemplate)) {
    throw new Error('Invalid design template for single widget');
  }
  
  if (!settings.theme || !['light', 'dark', 'minimal'].includes(settings.theme)) {
    throw new Error('Invalid theme for single widget');
  }
  
  if (!settings.selectTestimonial || !['manual-select', 'auto-latest', 'auto-random'].includes(settings.selectTestimonial)) {
    throw new Error('Invalid testimonial selection method for single widget');
  }
  
  if (settings.selectTestimonial === 'manual-select' && !settings.manualTestimonialId) {
    throw new Error('Manual testimonial ID is required when using manual-select');
  }
};

module.exports = mongoose.model('Widget', widgetSchema);
