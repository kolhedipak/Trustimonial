const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Widget = require('../models/Widget');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');

// @route   POST /api/spaces/:spaceId/widgets
// @desc    Create a new widget for a space
// @access  Private (space owner or admin)
router.post('/:spaceId/widgets', [
  auth,
  body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Widget name is required and must be 1-60 characters'),
  body('type').isIn(['wall', 'single']).withMessage('Widget type must be wall or single'),
  body('designTemplate').notEmpty().withMessage('Design template is required'),
  body('settings').isObject().withMessage('Settings must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { spaceId } = req.params;
    const { name, type, designTemplate, settings } = req.body;

    // Verify space ownership
    const space = await Space.findOne({ 
      _id: spaceId, 
      ownerId: req.user._id,
      isActive: true 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Create widget
    const widget = new Widget({
      spaceId: space._id,
      name,
      type,
      designTemplate,
      settings: {
        ...settings,
        theme: settings.theme || 'light',
        isPublic: settings.isPublic !== false // Default to true
      },
      createdBy: req.user._id
    });

    await widget.save();

    res.status(201).json({
      widget: {
        id: widget._id,
        name: widget.name,
        type: widget.type,
        designTemplate: widget.designTemplate,
        settings: widget.settings,
        status: widget.status,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt
      }
    });
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/spaces/:spaceId/widgets
// @desc    Get all widgets for a space
// @access  Private (space owner or admin)
router.get('/:spaceId/widgets', auth, async (req, res) => {
  try {
    const { spaceId } = req.params;

    // Verify space ownership
    const space = await Space.findOne({ 
      _id: spaceId, 
      ownerId: req.user._id,
      isActive: true 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const widgets = await Widget.find({ 
      spaceId: space._id 
    }).sort({ createdAt: -1 });

    res.json({
      widgets: widgets.map(widget => ({
        id: widget._id,
        name: widget.name,
        type: widget.type,
        designTemplate: widget.designTemplate,
        settings: widget.settings,
        status: widget.status,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get widgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/widgets/:widgetId/preview
// @desc    Get preview data for a widget
// @access  Private (space owner or admin)
router.get('/:widgetId/preview', auth, async (req, res) => {
  try {
    const { widgetId } = req.params;

    const widget = await Widget.findById(widgetId).populate('spaceId');
    
    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Verify space ownership
    if (widget.spaceId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let testimonials = [];

    if (widget.type === 'wall') {
      // Get approved testimonials for wall widget
      const query = { 
        spaceId: widget.spaceId._id, 
        status: 'approved' 
      };

      // Apply filters from settings
      const settings = widget.settings;
      if (settings.filter) {
        if (settings.filter.minRating) {
          query.rating = { $gte: settings.filter.minRating };
        }
        if (settings.filter.hasMedia) {
          query.$or = [
            { mediaUrl: { $exists: true, $ne: null } },
            { thumbnailUrl: { $exists: true, $ne: null } }
          ];
        }
      }

      // Apply sorting
      let sort = { createdAt: -1 };
      if (settings.sortOrder === 'highest_rating') {
        sort = { rating: -1, createdAt: -1 };
      } else if (settings.sortOrder === 'random') {
        sort = { $rand: {} };
      }

      testimonials = await Testimonial.find(query)
        .sort(sort)
        .limit(settings.itemsToShow || 12);
    } else if (widget.type === 'single') {
      // Get specific testimonial for single widget
      const settings = widget.settings;
      let testimonial;

      if (settings.selectTestimonial === 'manual-select' && settings.manualTestimonialId) {
        testimonial = await Testimonial.findOne({
          _id: settings.manualTestimonialId,
          spaceId: widget.spaceId._id,
          status: 'approved'
        });
      } else if (settings.selectTestimonial === 'auto-latest') {
        testimonial = await Testimonial.findOne({
          spaceId: widget.spaceId._id,
          status: 'approved'
        }).sort({ createdAt: -1 });
      } else if (settings.selectTestimonial === 'auto-random') {
        testimonial = await Testimonial.aggregate([
          { $match: { spaceId: widget.spaceId._id, status: 'approved' } },
          { $sample: { size: 1 } }
        ]);
        testimonial = testimonial[0];
      }

      if (testimonial) {
        testimonials = [testimonial];
      }
    }

    // Sanitize testimonials for preview
    const sanitizedTestimonials = testimonials.map(testimonial => ({
      id: testimonial._id,
      type: testimonial.type,
      authorName: testimonial.authorName,
      content: testimonial.content,
      rating: testimonial.rating,
      mediaUrl: testimonial.mediaUrl,
      thumbnailUrl: testimonial.thumbnailUrl,
      questionResponses: testimonial.questionResponses || [],
      createdAt: testimonial.createdAt
    }));

    res.json({
      widget: {
        id: widget._id,
        name: widget.name,
        type: widget.type,
        designTemplate: widget.designTemplate,
        settings: widget.settings
      },
      testimonials: sanitizedTestimonials
    });
  } catch (error) {
    console.error('Get widget preview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/widgets/:widgetId
// @desc    Update a widget
// @access  Private (space owner or admin)
router.put('/:widgetId', [
  auth,
  body('name').optional().trim().isLength({ min: 1, max: 60 }).withMessage('Widget name must be 1-60 characters'),
  body('designTemplate').optional().notEmpty().withMessage('Design template cannot be empty'),
  body('settings').optional().isObject().withMessage('Settings must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { widgetId } = req.params;
    const updates = req.body;

    const widget = await Widget.findById(widgetId).populate('spaceId');
    
    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Verify space ownership
    if (widget.spaceId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update widget
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        widget[key] = updates[key];
      }
    });

    await widget.save();

    res.json({
      widget: {
        id: widget._id,
        name: widget.name,
        type: widget.type,
        designTemplate: widget.designTemplate,
        settings: widget.settings,
        status: widget.status,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt
      }
    });
  } catch (error) {
    console.error('Update widget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/widgets/:widgetId
// @desc    Delete a widget
// @access  Private (space owner or admin)
router.delete('/:widgetId', auth, async (req, res) => {
  try {
    const { widgetId } = req.params;

    const widget = await Widget.findById(widgetId).populate('spaceId');
    
    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Verify space ownership
    if (widget.spaceId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Widget.findByIdAndDelete(widgetId);

    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    console.error('Delete widget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
