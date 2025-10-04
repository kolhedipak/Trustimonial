const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Testimonial = require('../models/Testimonial');
const RequestLink = require('../models/RequestLink');
const { auth, adminAuth, userAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/testimonials
// @desc    Submit testimonial (via link or authenticated)
// @access  Public (via link) / Private (authenticated)
router.post('/', [
  body('authorName').trim().isLength({ min: 1, max: 100 }).withMessage('Author name is required and must be 1-100 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('authorEmail').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('sourceLink').optional().isString().withMessage('Source link must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { authorName, authorEmail, content, rating, images, sourceLink } = req.body;

    // If sourceLink provided, validate and increment usage
    if (sourceLink) {
      const link = await RequestLink.findOne({ slug: sourceLink });
      if (!link || !link.isValid()) {
        return res.status(400).json({ message: 'Invalid or expired testimonial link' });
      }
    }

    const testimonialData = {
      authorName,
      authorEmail,
      content,
      rating,
      images: images || [],
      sourceLink
    };

    // If user is authenticated, set createdBy
    if (req.user) {
      testimonialData.createdBy = req.user._id;
      // Auto-approve if user is admin
      if (req.user.role === 'Admin') {
        testimonialData.status = 'approved';
        testimonialData.approvedAt = new Date();
      }
    }

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    // Increment link usage if applicable
    if (sourceLink) {
      await RequestLink.findOneAndUpdate(
        { slug: sourceLink },
        { $inc: { uses: 1 } }
      );
    }

    res.status(201).json({
      message: 'Testimonial submitted successfully',
      testimonial: {
        id: testimonial._id,
        authorName: testimonial.authorName,
        content: testimonial.content,
        rating: testimonial.rating,
        status: testimonial.status,
        submittedAt: testimonial.submittedAt
      }
    });
  } catch (error) {
    console.error('Testimonial submission error:', error);
    res.status(500).json({ message: 'Server error during testimonial submission' });
  }
});

// @route   GET /api/testimonials
// @desc    List testimonials with filters
// @access  Public (approved only) / Private (all with filters)
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status filter'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating filter must be 1-5'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, rating, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    // If not authenticated or not admin, only show approved
    if (!req.user || req.user.role !== 'Admin') {
      filter.status = 'approved';
    } else if (status) {
      filter.status = status;
    }

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const testimonials = await Testimonial.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .select('-authorEmail -metadata');

    const total = await Testimonial.countDocuments(filter);

    res.json({
      testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/testimonials/:id
// @desc    Get testimonial details
// @access  Public (approved only) / Private (all)
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // If not authenticated or not admin, only show approved
    if ((!req.user || req.user.role !== 'Admin') && testimonial.status !== 'approved') {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ testimonial });
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/testimonials/:id
// @desc    Edit testimonial
// @access  Private (owner or admin)
router.put('/:id', auth, [
  body('authorName').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Author name must be 1-100 characters'),
  body('content').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && testimonial.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this testimonial' });
    }

    const updates = req.body;
    Object.assign(testimonial, updates);
    await testimonial.save();

    res.json({
      message: 'Testimonial updated successfully',
      testimonial
    });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial
// @access  Private (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && testimonial.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this testimonial' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/testimonials/:id/approve
// @desc    Approve testimonial
// @access  Private (admin only)
router.post('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.status = 'approved';
    testimonial.approvedAt = new Date();
    await testimonial.save();

    res.json({
      message: 'Testimonial approved successfully',
      testimonial
    });
  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
