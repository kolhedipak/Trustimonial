const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');
const { body, validationResult } = require('express-validator');

// @route   GET /api/spaces/:spaceId
// @desc    Get space details including credits
// @access  Private (owner or admin)
router.get('/:spaceId', auth, async (req, res) => {
  try {
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
      isActive: true 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Get testimonial counts for credits
    const videoCount = await Testimonial.countDocuments({ 
      spaceId: space._id, 
      type: 'video',
      status: { $ne: 'deleted' }
    });
    
    const textCount = await Testimonial.countDocuments({ 
      spaceId: space._id, 
      type: 'text',
      status: { $ne: 'deleted' }
    });

    // Mock credits (in real app, this would come from a credits/billing system)
    const credits = {
      videoCredits: Math.max(0, 10 - videoCount), // Example: 10 video credits
      textCredits: Math.max(0, 100 - textCount)   // Example: 100 text credits
    };

    res.json({
      space: {
        id: space._id,
        name: space.name,
        description: space.description,
        logo: space.logo,
        headerTitle: space.headerTitle,
        headerMessage: space.headerMessage,
        questionList: space.questionList,
        collectExtras: space.collectExtras,
        collectionType: space.collectionType,
        theme: space.theme,
        buttonColor: space.buttonColor,
        language: space.language,
        autoTranslate: space.autoTranslate,
        createdAt: space.createdAt,
        updatedAt: space.updatedAt
      },
      credits
    });
  } catch (error) {
    console.error('Get space detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/spaces/:spaceId/testimonials
// @desc    Get testimonials for a space with filters
// @access  Private (owner or admin)
router.get('/:spaceId/testimonials', auth, async (req, res) => {
  try {
    const { filter = 'all', page = 1, limit = 20, sort = 'createdAt' } = req.query;
    
    // Verify space ownership
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
    
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Build filter query
    let query = { spaceId: space._id };
    
    switch (filter) {
      case 'video':
        query.type = 'video';
        break;
      case 'text':
        query.type = 'text';
        break;
      case 'linked':
        query.type = 'linked';
        break;
      case 'archived':
        query.status = 'archived';
        break;
      case 'spam':
        query.status = 'spam';
        break;
      case 'all':
      default:
        // No additional filters
        break;
    }

    const testimonials = await Testimonial.find(query)
      .sort({ [sort]: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials: testimonials.map(testimonial => ({
        id: testimonial._id,
        type: testimonial.type,
        authorName: testimonial.authorName,
        authorEmail: testimonial.authorEmail,
        content: testimonial.content,
        rating: testimonial.rating,
        mediaUrl: testimonial.mediaUrl,
        thumbnailUrl: testimonial.thumbnailUrl,
        collectedVia: testimonial.collectedVia,
        status: testimonial.status,
        questionResponses: testimonial.questionResponses || [],
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get space testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/spaces/:spaceId/testimonials
// @desc    Create a new testimonial for a space
// @access  Private (owner or admin)
router.post('/:spaceId/testimonials', [
  auth,
  body('type').isIn(['video', 'text', 'linked']).withMessage('Invalid testimonial type'),
  body('authorName').optional().trim().isLength({ max: 100 }).withMessage('Author name too long'),
  body('authorEmail').optional().isEmail().withMessage('Invalid email'),
  body('content').optional().trim().isLength({ max: 2000 }).withMessage('Content too long'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('collectedVia').optional().isIn(['link', 'embed', 'import', 'social']).withMessage('Invalid collection method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify space ownership
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
      isDeleted: false 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const testimonial = new Testimonial({
      spaceId: space._id,
      createdBy: req.user._id,
      ...req.body
    });

    await testimonial.save();

    res.status(201).json({
      testimonial: {
        id: testimonial._id,
        type: testimonial.type,
        authorName: testimonial.authorName,
        authorEmail: testimonial.authorEmail,
        content: testimonial.content,
        rating: testimonial.rating,
        mediaUrl: testimonial.mediaUrl,
        thumbnailUrl: testimonial.thumbnailUrl,
        collectedVia: testimonial.collectedVia,
        status: testimonial.status,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      }
    });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/spaces/:spaceId/testimonials/:testimonialId/actions
// @desc    Perform action on a testimonial (approve, reject, archive, unarchive, spam, delete)
// @access  Private (owner or admin)
router.post('/:spaceId/testimonials/:testimonialId/actions', [
  auth,
  body('action').isIn(['approve', 'reject', 'archive', 'unarchive', 'spam', 'delete']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action } = req.body;

    // Verify space ownership
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
      
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const testimonial = await Testimonial.findOne({
      _id: req.params.testimonialId,
      spaceId: space._id
    });

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Update testimonial based on action
    switch (action) {
      case 'approve':
        testimonial.status = 'approved';
        testimonial.approvedAt = new Date();
        break;
      case 'reject':
        testimonial.status = 'rejected';
        break;
      case 'archive':
        testimonial.status = 'archived';
        break;
      case 'unarchive':
        testimonial.status = 'pending';
        break;
      case 'spam':
        testimonial.status = 'spam';
        break;
      case 'delete':
        testimonial.status = 'deleted';
        break;
    }

    await testimonial.save();

    res.json({
      message: `Testimonial ${action}d successfully`,
      testimonial: {
        id: testimonial._id,
        status: testimonial.status
      }
    });
  } catch (error) {
    console.error('Testimonial action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/spaces/:spaceId/testimonials/bulk
// @desc    Bulk actions on testimonials
// @access  Private (owner or admin)
router.post('/:spaceId/testimonials/bulk', [
  auth,
  body('testimonialIds').isArray().withMessage('Testimonial IDs must be an array'),
  body('action').isIn(['approve', 'reject', 'archive', 'unarchive', 'spam', 'delete']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testimonialIds, action } = req.body;

    // Verify space ownership
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
      isDeleted: false 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Update testimonials
    const updateData = {};
    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.approvedAt = new Date();
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'archive':
        updateData.status = 'archived';
        break;
      case 'unarchive':
        updateData.status = 'pending';
        break;
      case 'spam':
        updateData.status = 'spam';
        break;
      case 'delete':
        updateData.status = 'deleted';
        break;
    }

    const result = await Testimonial.updateMany(
      { 
        _id: { $in: testimonialIds },
        spaceId: space._id 
      },
      updateData
    );

    res.json({
      message: `${result.modifiedCount} testimonials ${action}d successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk testimonial action error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/spaces/:spaceId/integrations
// @desc    Get available integrations for a space
// @access  Private (owner or admin)
router.get('/:spaceId/integrations', auth, async (req, res) => {
  try {
    // Verify space ownership
    const space = await Space.findOne({ 
      _id: req.params.spaceId, 
      ownerId: req.user._id,
      isDeleted: false 
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Mock integrations data
    const integrations = [
      {
        id: 'social-media',
        name: 'Social Media',
        description: 'Import testimonials from social media platforms',
        connected: false,
        lastSync: null
      },
      {
        id: 'external-videos',
        name: 'External Videos',
        description: 'Import video testimonials from external sources',
        connected: false,
        lastSync: null
      },
      {
        id: 'email-assistant',
        name: 'Email Assistant',
        description: 'Automated email testimonial collection',
        connected: false,
        lastSync: null
      }
    ];

    res.json({ integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
