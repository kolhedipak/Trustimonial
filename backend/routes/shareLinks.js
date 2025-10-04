const express = require('express');
const router = express.Router();
const { publicSubmissionLimiter } = require('../middleware/rateLimiter');
const { sanitizeInputs, validatePublicSubmission } = require('../middleware/sanitizer');
const Space = require('../models/Space');
const { body, validationResult } = require('express-validator');


// @route   GET /s/:spaceId
// @desc    Public route that returns space config for rendering the submission form
// @access  Public
router.get('/:spaceId', async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const space = await Space.findOne({ _id: spaceId, isActive: true });
    
    if (!space) {
      return res.status(404).json({ message: 'Space not found or not active' });
    }
    
    res.json({
      space: {
        id: space._id,
        name: space.name,
        description: space.description,
        logo: space.logo,
        headerTitle: space.headerTitle,
        headerMessage: space.headerMessage,
        questionList: space.questionList,
        theme: space.theme,
        buttonColor: space.buttonColor,
        collectExtras: space.collectExtras,
        collectionType: space.collectionType,
        language: space.language,
        autoTranslate: space.autoTranslate
      }
    });
  } catch (error) {
    console.error('Get public share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /s/:spaceId/submissions
// @desc    Accept testimonial submissions from public form
// @access  Public
router.post('/:spaceId/submissions', publicSubmissionLimiter, async (req, res) => {
  try {
    const { spaceId } = req.params;
    
    const space = await Space.findOne({ _id: spaceId, isActive: true });
    if (!space) {
      return res.status(404).json({ message: 'Space not found or not active' });
    }

    // TODO: Implement rate limiting per IP and per space
    // TODO: Implement CAPTCHA validation if space requires it
    // TODO: Implement file upload handling for mediaFile

    const Testimonial = require('../models/Testimonial');
    
    // Handle both JSON and FormData submissions
    let submissionData;
    if (req.body.data) {
      // FormData submission with media file
      try {
        submissionData = JSON.parse(req.body.data);
      } catch (error) {
        console.error('Error parsing submission data:', error);
        return res.status(400).json({ message: 'Invalid submission data format' });
      }
    } else {
      // JSON submission
      submissionData = req.body;
    }
    
    const { name, email, content, rating, meta, questionResponses } = submissionData;

    // Debug logging
    console.log('Received submission data:', submissionData);
    console.log('Question responses:', questionResponses);

    // Validate required fields based on space settings
    const errors = [];
    
    // Check if we have any content (either in content field or question responses)
    if ((!content || content.trim() === '') && (!questionResponses || questionResponses.length === 0)) {
      errors.push('Either content or question responses are required');
    }
    
    // Validate question responses if present
    if (questionResponses && questionResponses.length > 0) {
      questionResponses.forEach((response, index) => {
        if (!response.question || !response.answer) {
          errors.push(`Question ${index + 1} is missing question or answer`);
        }
        if (response.answer && response.answer.length > 2000) {
          errors.push(`Question ${index + 1} answer is too long`);
        }
        if (response.rating && (response.rating < 1 || response.rating > 5)) {
          errors.push(`Question ${index + 1} rating must be between 1 and 5`);
        }
      });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors 
      });
    }

    // Determine testimonial type based on collectionType
    let type = 'text';
    if (space.collectionType === 'text-and-video' && req.body.mediaFile) {
      type = 'video';
    }

    // Process question responses
    const processedQuestionResponses = [];
    if (questionResponses && Array.isArray(questionResponses)) {
      questionResponses.forEach((response, index) => {
        if (response.question && response.answer) {
          const processedResponse = {
            questionIndex: index,
            question: response.question,
            answer: response.answer
          };
          
          // Only add rating if it's a valid number
          if (response.rating && typeof response.rating === 'number' && response.rating >= 1 && response.rating <= 5) {
            processedResponse.rating = response.rating;
          }
          
          processedQuestionResponses.push(processedResponse);
        }
      });
    }

    // Create content from question responses if no direct content provided
    let testimonialContent = content;
    if (!testimonialContent && processedQuestionResponses.length > 0) {
      testimonialContent = processedQuestionResponses
        .map(response => `Q: ${response.question}\nA: ${response.answer}`)
        .join('\n\n');
    }

    const testimonial = new Testimonial({
      spaceId: space._id,
      type,
      authorName: name,
      authorEmail: email,
      content: testimonialContent,
      rating,
      questionResponses: processedQuestionResponses,
      collectedVia: 'link',
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        ...meta
      }
    });

    await testimonial.save();

    res.status(201).json({
      message: 'Testimonial submitted successfully',
      submissionId: testimonial._id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Public submission error:', error);
    res.status(500).json({ message: 'Server error during submission' });
  }
});


module.exports = router;
