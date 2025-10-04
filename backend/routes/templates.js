const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const { auth, userAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/templates
// @desc    List templates (public and user's own)
// @access  Private (user or admin)
router.get('/', auth, userAuth, async (req, res) => {
  try {
    const templates = await Template.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/templates
// @desc    Create template
// @access  Private (user or admin)
router.post('/', auth, userAuth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Template name is required and must be 1-100 characters'),
  body('formConfig').isObject().withMessage('Form configuration is required')
    .custom((value) => {
      if (!value.fields || !Array.isArray(value.fields)) {
        throw new Error('Form config must have a fields array');
      }
      return true;
    }),
  body('emailSubject').optional().trim().isLength({ max: 200 }).withMessage('Email subject cannot exceed 200 characters'),
  body('emailBody').optional().trim().isLength({ max: 5000 }).withMessage('Email body cannot exceed 5000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, formConfig, emailSubject, emailBody, isPublic = false } = req.body;

    const template = new Template({
      name,
      formConfig,
      emailSubject,
      emailBody,
      isPublic,
      createdBy: req.user._id
    });

    await template.save();

    res.status(201).json({
      message: 'Template created successfully',
      template: {
        id: template._id,
        name: template.name,
        formConfig: template.formConfig,
        emailSubject: template.emailSubject,
        emailBody: template.emailBody,
        isPublic: template.isPublic,
        createdAt: template.createdAt
      }
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: 'Server error during template creation' });
  }
});

// @route   GET /api/templates/:id
// @desc    Get template details
// @access  Private (owner or public template)
router.get('/:id', auth, userAuth, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { isPublic: true },
        { createdBy: req.user._id }
      ]
    }).populate('createdBy', 'name');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/templates/:id
// @desc    Update template
// @access  Private (owner only)
router.put('/:id', auth, userAuth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Template name must be 1-100 characters'),
  body('formConfig').optional().isObject().withMessage('Form configuration must be an object')
    .custom((value) => {
      if (value && (!value.fields || !Array.isArray(value.fields))) {
        throw new Error('Form config must have a fields array');
      }
      return true;
    }),
  body('emailSubject').optional().trim().isLength({ max: 200 }).withMessage('Email subject cannot exceed 200 characters'),
  body('emailBody').optional().trim().isLength({ max: 5000 }).withMessage('Email body cannot exceed 5000 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check ownership
    if (template.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this template' });
    }

    const updates = req.body;
    Object.assign(template, updates);
    await template.save();

    res.json({
      message: 'Template updated successfully',
      template: {
        id: template._id,
        name: template.name,
        formConfig: template.formConfig,
        emailSubject: template.emailSubject,
        emailBody: template.emailBody,
        isPublic: template.isPublic,
        createdAt: template.createdAt
      }
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/templates/:id
// @desc    Delete template
// @access  Private (owner only)
router.delete('/:id', auth, userAuth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check ownership
    if (template.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this template' });
    }

    await Template.findByIdAndDelete(req.params.id);

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
