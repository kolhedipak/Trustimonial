const express = require('express');
const { body, validationResult } = require('express-validator');
const RequestLink = require('../models/RequestLink');
const Template = require('../models/Template');
const { auth, userAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/links
// @desc    Create a testimonial request link
// @access  Private (user or admin)
router.post('/', auth, userAuth, [
  body('slug').trim().isLength({ min: 3, max: 50 }).withMessage('Slug must be 3-50 characters')
    .matches(/^[a-z0-9-_]+$/).withMessage('Slug can only contain lowercase letters, numbers, hyphens, and underscores'),
  body('templateId').optional().isMongoId().withMessage('Invalid template ID'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slug, templateId, expiryDate, maxUses } = req.body;

    // Check if slug already exists
    const existingLink = await RequestLink.findOne({ slug });
    if (existingLink) {
      return res.status(400).json({ message: 'Slug already exists' });
    }

    // Validate template if provided
    if (templateId) {
      const template = await Template.findOne({
        _id: templateId,
        $or: [{ createdBy: req.user._id }, { isPublic: true }]
      });
      if (!template) {
        return res.status(400).json({ message: 'Template not found or not accessible' });
      }
    }

    const linkData = {
      owner: req.user._id,
      slug,
      templateId,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined
    };

    const link = new RequestLink(linkData);
    await link.save();

    res.status(201).json({
      message: 'Request link created successfully',
      link: {
        id: link._id,
        slug: link.slug,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/t/${link.slug}`,
        expiryDate: link.expiryDate,
        maxUses: link.maxUses,
        uses: link.uses,
        isActive: link.isActive,
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ message: 'Server error during link creation' });
  }
});

// @route   GET /api/links
// @desc    Get user's request links
// @access  Private (user or admin)
router.get('/', auth, userAuth, async (req, res) => {
  try {
    const links = await RequestLink.find({ owner: req.user._id })
      .populate('templateId', 'name')
      .sort({ createdAt: -1 });

    const linksWithUrls = links.map(link => ({
      id: link._id,
      slug: link.slug,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/t/${link.slug}`,
      templateId: link.templateId,
      expiryDate: link.expiryDate,
      maxUses: link.maxUses,
      uses: link.uses,
      isActive: link.isActive,
      isValid: link.isValid(),
      createdAt: link.createdAt
    }));

    res.json({ links: linksWithUrls });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links/:id
// @desc    Get specific request link
// @access  Private (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const link = await RequestLink.findById(req.params.id)
      .populate('templateId', 'name formConfig')
      .populate('owner', 'name email');

    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && link.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this link' });
    }

    res.json({
      link: {
        id: link._id,
        slug: link.slug,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/t/${link.slug}`,
        templateId: link.templateId,
        expiryDate: link.expiryDate,
        maxUses: link.maxUses,
        uses: link.uses,
        isActive: link.isActive,
        isValid: link.isValid(),
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/links/:id
// @desc    Update request link
// @access  Private (owner or admin)
router.put('/:id', auth, [
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const link = await RequestLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && link.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this link' });
    }

    const updates = req.body;
    if (updates.expiryDate) {
      updates.expiryDate = new Date(updates.expiryDate);
    }
    if (updates.maxUses) {
      updates.maxUses = parseInt(updates.maxUses);
    }

    Object.assign(link, updates);
    await link.save();

    res.json({
      message: 'Link updated successfully',
      link: {
        id: link._id,
        slug: link.slug,
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/t/${link.slug}`,
        expiryDate: link.expiryDate,
        maxUses: link.maxUses,
        uses: link.uses,
        isActive: link.isActive,
        isValid: link.isValid(),
        createdAt: link.createdAt
      }
    });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/links/:id
// @desc    Delete request link
// @access  Private (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await RequestLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && link.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this link' });
    }

    await RequestLink.findByIdAndDelete(req.params.id);

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
