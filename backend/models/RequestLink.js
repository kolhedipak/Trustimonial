const mongoose = require('mongoose');

const requestLinkSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, and underscores'],
    minlength: [3, 'Slug must be at least 3 characters'],
    maxlength: [50, 'Slug cannot exceed 50 characters']
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
  uses: {
    type: Number,
    default: 0,
    min: [0, 'Uses cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
requestLinkSchema.index({ slug: 1 });
requestLinkSchema.index({ owner: 1 });
requestLinkSchema.index({ isActive: 1 });

// Check if link is still valid
requestLinkSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  if (this.maxUses && this.uses >= this.maxUses) return false;
  return true;
};

// Increment usage count
requestLinkSchema.methods.incrementUsage = function() {
  this.uses += 1;
  return this.save();
};

module.exports = mongoose.model('RequestLink', requestLinkSchema);
