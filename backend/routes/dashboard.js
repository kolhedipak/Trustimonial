const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');
const RequestLink = require('../models/RequestLink');
const { auth, userAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview data
// @access  Private (user or admin)
router.get('/overview', auth, userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total videos (testimonials with images)
    const totalVideos = await Testimonial.countDocuments({
      createdBy: userId,
      images: { $exists: true, $not: { $size: 0 } }
    });

    // Get total spaces
    const totalSpaces = await Space.countDocuments({
      ownerId: userId,
      isActive: true
    });

    // Get total testimonials
    const totalTestimonials = await Testimonial.countDocuments({
      createdBy: userId
    });

    // Get active share links
    const activeShareLinks = await RequestLink.countDocuments({
      owner: userId,
      isActive: true
    });

    // Mock plan data (in real app, this would come from user subscription)
    const planName = 'Starter';
    const videoLimit = 2;
    const planFeatures = [
      '2 videos total',
      'basic widgets',
      'unlimited text testimonials',
      'custom branding'
    ];

    const overview = {
      totalVideos,
      videoLimit,
      totalSpaces,
      totalTestimonials,
      activeShareLinks,
      planName,
      planFeatures,
      videoUsagePercent: Math.round((totalVideos / videoLimit) * 100)
    };

    res.json({ overview });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/spaces
// @desc    Get user's spaces
// @access  Private (user or admin)
router.get('/spaces', auth, userAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const spaces = await Space.find({ 
      ownerId: req.user._id,
      isActive: true 
    })
    .populate('templateId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get stats for each space
    const spacesWithStats = await Promise.all(
      spaces.map(async (space) => {
        const stats = {
          videos: await Testimonial.countDocuments({
            spaceId: space._id,
            images: { $exists: true, $not: { $size: 0 } }
          }),
          testimonials: await Testimonial.countDocuments({
            spaceId: space._id
          }),
          activeShareLinks: await RequestLink.countDocuments({
            owner: req.user._id,
            isActive: true
          })
        };

        return {
          id: space._id,
          name: space.name,
          description: space.description,
          createdAt: space.createdAt,
          stats,
          templateId: space.templateId,
          expiryDate: space.expiryDate,
          maxUses: space.maxUses
        };
      })
    );

    const total = await Space.countDocuments({ 
      ownerId: req.user._id,
      isActive: true 
    });

    res.json({
      spaces: spacesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get spaces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/spaces/debug
// @desc    Debug space creation data
// @access  Private (user or admin)
router.post('/spaces/debug', auth, userAuth, (req, res) => {
  console.log('=== DEBUG SPACE CREATION ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('================================');
  
  res.json({
    message: 'Debug data logged',
    receivedData: req.body,
    validation: {
      hasName: !!req.body.name,
      nameLength: req.body.name ? req.body.name.length : 0,
      hasQuestionList: Array.isArray(req.body.questionList),
      questionListLength: req.body.questionList ? req.body.questionList.length : 0,
      hasCollectExtras: Array.isArray(req.body.collectExtras),
      collectExtrasLength: req.body.collectExtras ? req.body.collectExtras.length : 0,
      language: req.body.language,
      languageLength: req.body.language ? req.body.language.length : 0
    }
  });
});

// @route   POST /api/spaces
// @desc    Create a new space
// @access  Private (user or admin)
router.post('/spaces', auth, userAuth, [
  body('name').trim().isLength({ min: 3, max: 60 }).withMessage('Name must be 3-60 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('logo').optional().custom((value) => {
    if (!value || value === null || value === '') return true;
    return /^https?:\/\/.+/.test(value);
  }).withMessage('Invalid logo URL'),
  body('headerTitle').optional().trim().isLength({ max: 80 }).withMessage('Header title cannot exceed 80 characters'),
  body('headerMessage').optional().trim().isLength({ max: 300 }).withMessage('Header message cannot exceed 300 characters'),
  body('questionList').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questionList.*').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Each question must be 1-100 characters'),
  body('collectExtras').optional().custom((value) => {
    if (value === undefined || value === null) return true;
    if (!Array.isArray(value)) return false;
    return value.every(item => ['name', 'email', 'title', 'social'].includes(item));
  }).withMessage('Collect extras must be an array of valid types'),
  body('collectionType').optional().isIn(['text-only', 'text-and-star', 'text-and-video']).withMessage('Invalid collection type'),
  body('theme').optional().isIn(['light', 'dark', 'minimal']).withMessage('Invalid theme'),
  body('buttonColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Button color must be a valid hex color'),
  body('language').optional().isLength({ min: 2, max: 2 }).withMessage('Language must be 2 characters'),
  body('autoTranslate').optional().isBoolean().withMessage('Auto translate must be boolean'),
  body('templateId').optional().isMongoId().withMessage('Invalid template ID'),
  body('expiryDate').optional().custom((value) => {
    if (!value || value === '') return true;
    return new Date(value).toString() !== 'Invalid Date';
  }).withMessage('Invalid expiry date format'),
  body('maxUses').optional().custom((value) => {
    if (!value || value === '') return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1;
  }).withMessage('Max uses must be a positive integer')
], async (req, res) => {
  try {
    console.log('Received space creation request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      description, 
      logo,
      headerTitle,
      headerMessage,
      questionList,
      collectExtras,
      collectionType,
      theme,
      buttonColor,
      language,
      autoTranslate,
      templateId, 
      expiryDate, 
      maxUses 
    } = req.body;

    // Validate template if provided
    if (templateId) {
      const template = await require('../models/Template').findOne({
        _id: templateId,
        $or: [{ createdBy: req.user._id }, { isPublic: true }]
      });
      if (!template) {
        return res.status(400).json({ message: 'Template not found or not accessible' });
      }
    }

    const space = new Space({
      ownerId: req.user._id,
      name,
      description: description || undefined,
      logo: logo || undefined,
      headerTitle: headerTitle || undefined,
      headerMessage: headerMessage || undefined,
      questionList: questionList.filter(q => q && q.trim()),
      collectExtras: collectExtras || [],
      collectionType: collectionType || 'text-and-video',
      theme: theme || 'light',
      buttonColor: buttonColor || '#00A676',
      language: language || 'en',
      autoTranslate: autoTranslate || false,
      templateId: templateId || undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined
    });

    await space.save();

    // Generate public link
    const publicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/t/${space._id}`;

    // Get stats for the new space
    const stats = {
      videos: 0,
      testimonials: 0,
      activeShareLinks: 0
    };

    res.status(201).json({
      message: 'Space created successfully',
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
        stats,
        templateId: space.templateId,
        expiryDate: space.expiryDate,
        maxUses: space.maxUses,
        publicLink
      }
    });
  } catch (error) {
    console.error('Create space error:', error);
    res.status(500).json({ message: 'Server error during space creation' });
  }
});

// @route   GET /api/spaces/:id
// @desc    Get specific space
// @access  Private (owner or admin)
router.get('/spaces/:id', auth, async (req, res) => {
  try {
    const space = await Space.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    }).populate('templateId', 'name formConfig');

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Get stats for the space
    const stats = {
      videos: await Testimonial.countDocuments({
        spaceId: space._id,
        images: { $exists: true, $not: { $size: 0 } }
      }),
      testimonials: await Testimonial.countDocuments({
        spaceId: space._id
      }),
      activeShareLinks: await RequestLink.countDocuments({
        owner: req.user._id,
        isActive: true
      })
    };

    res.json({
      space: {
        id: space._id,
        name: space.name,
        description: space.description,
        createdAt: space.createdAt,
        stats,
        templateId: space.templateId,
        expiryDate: space.expiryDate,
        maxUses: space.maxUses
      }
    });
  } catch (error) {
    console.error('Get space error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/spaces/:id
// @desc    Update space
// @access  Private (owner or admin)
router.put('/spaces/:id', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('expiryDate').optional().isISO8601().withMessage('Invalid expiry date format'),
  body('maxUses').optional().isInt({ min: 1 }).withMessage('Max uses must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const space = await Space.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const updates = req.body;
    if (updates.expiryDate) {
      updates.expiryDate = new Date(updates.expiryDate);
    }
    if (updates.maxUses) {
      updates.maxUses = parseInt(updates.maxUses);
    }

    Object.assign(space, updates);
    await space.save();

    res.json({
      message: 'Space updated successfully',
      space: {
        id: space._id,
        name: space.name,
        description: space.description,
        createdAt: space.createdAt,
        templateId: space.templateId,
        expiryDate: space.expiryDate,
        maxUses: space.maxUses
      }
    });
  } catch (error) {
    console.error('Update space error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/spaces/:id
// @desc    Delete space (soft delete)
// @access  Private (owner or admin)
router.delete('/spaces/:id', auth, async (req, res) => {
  try {
    const space = await Space.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Soft delete by setting isActive to false
    space.isActive = false;
    await space.save();

    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Delete space error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
