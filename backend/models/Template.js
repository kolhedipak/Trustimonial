const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [100, 'Template name cannot exceed 100 characters']
  },
  formConfig: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Form configuration is required'],
    validate: {
      validator: function(v) {
        return v && typeof v === 'object' && Array.isArray(v.fields);
      },
      message: 'Form config must be an object with a fields array'
    }
  },
  emailSubject: {
    type: String,
    trim: true,
    maxlength: [200, 'Email subject cannot exceed 200 characters']
  },
  emailBody: {
    type: String,
    trim: true,
    maxlength: [5000, 'Email body cannot exceed 5000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
templateSchema.index({ createdBy: 1 });
templateSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Template', templateSchema);
