const express = require('express');
const RequestLink = require('../models/RequestLink');
const Template = require('../models/Template');

const router = express.Router();

// @route   GET /t/:slug
// @desc    Public testimonial submission page
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the request link
    const link = await RequestLink.findOne({ slug })
      .populate('templateId', 'name formConfig emailSubject emailBody')
      .populate('owner', 'name email');

    if (!link) {
      return res.status(404).json({ message: 'Testimonial link not found' });
    }

    // Check if link is still valid
    if (!link.isValid()) {
      return res.status(410).json({ 
        message: 'This testimonial link has expired or reached its usage limit' 
      });
    }

    // Get template configuration
    let formConfig = {
      fields: ['authorName', 'content', 'rating']
    };

    if (link.templateId) {
      formConfig = link.templateId.formConfig;
    }

    // Return the link data for the frontend to render
    res.json({
      link: {
        id: link._id,
        slug: link.slug,
        owner: link.owner,
        template: link.templateId,
        formConfig,
        expiryDate: link.expiryDate,
        maxUses: link.maxUses,
        uses: link.uses,
        isActive: link.isActive
      }
    });
  } catch (error) {
    console.error('Get public link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
