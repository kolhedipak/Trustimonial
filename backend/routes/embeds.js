const express = require('express');
const router = express.Router();
const Widget = require('../models/Widget');
const Testimonial = require('../models/Testimonial');
const Space = require('../models/Space');

// @route   GET /embed/wall/:widgetId
// @desc    Public embed route for wall of love widget (iframe)
// @access  Public
router.get('/wall/:widgetId', async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { theme } = req.query;

    const widget = await Widget.findById(widgetId).populate('spaceId');
    
    if (!widget || !widget.settings.isPublic) {
      return res.status(404).send(`
        <html>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
            <p>Widget not found or not available</p>
          </body>
        </html>
      `);
    }

    // Check allowed origins if set
    if (widget.settings.accessControl && widget.settings.accessControl.allowedOrigins) {
      const origin = req.get('origin') || req.get('referer');
      if (origin && !widget.settings.accessControl.allowedOrigins.includes(origin)) {
        return res.status(403).send(`
          <html>
            <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
              <p>Access denied</p>
            </body>
          </html>
        `);
      }
    }

    // Get testimonials for the widget
    const query = { 
      spaceId: widget.spaceId._id, 
      status: 'approved' 
    };

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

    let sort = { createdAt: -1 };
    if (settings.sortOrder === 'highest_rating') {
      sort = { rating: -1, createdAt: -1 };
    } else if (settings.sortOrder === 'random') {
      sort = { $rand: {} };
    }

    const testimonials = await Testimonial.find(query)
      .sort(sort)
      .limit(settings.itemsToShow || 12);

    // Sanitize testimonials
    const sanitizedTestimonials = testimonials.map(testimonial => ({
      id: testimonial._id.toString(),
      type: testimonial.type,
      authorName: sanitizeHtml(testimonial.authorName || 'Anonymous'),
      content: sanitizeHtml(testimonial.content || ''),
      rating: testimonial.rating,
      mediaUrl: testimonial.mediaUrl,
      thumbnailUrl: testimonial.thumbnailUrl,
      questionResponses: testimonial.questionResponses || [],
      createdAt: testimonial.createdAt
    }));

    // Generate HTML based on design template
    const html = generateWallHTML(widget, sanitizedTestimonials, theme || settings.theme);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.send(html);
  } catch (error) {
    console.error('Wall embed error:', error);
    res.status(500).send(`
      <html>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
          <p>Error loading widget</p>
        </body>
      </html>
    `);
  }
});

// @route   GET /embed/single/:widgetId
// @desc    Public embed route for single testimonial widget (iframe)
// @access  Public
router.get('/single/:widgetId', async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { theme } = req.query;

    const widget = await Widget.findById(widgetId).populate('spaceId');
    
    if (!widget || !widget.settings.isPublic) {
      return res.status(404).send(`
        <html>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
            <p>Widget not found or not available</p>
          </body>
        </html>
      `);
    }

    // Check allowed origins if set
    if (widget.settings.accessControl && widget.settings.accessControl.allowedOrigins) {
      const origin = req.get('origin') || req.get('referer');
      if (origin && !widget.settings.accessControl.allowedOrigins.includes(origin)) {
        return res.status(403).send(`
          <html>
            <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
              <p>Access denied</p>
            </body>
          </html>
        `);
      }
    }

    // Get testimonial for the widget
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
      const testimonials = await Testimonial.aggregate([
        { $match: { spaceId: widget.spaceId._id, status: 'approved' } },
        { $sample: { size: 1 } }
      ]);
      testimonial = testimonials[0];
    }

    if (!testimonial) {
      return res.status(404).send(`
        <html>
          <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
            <p>No testimonial available</p>
          </body>
        </html>
      `);
    }

    // Sanitize testimonial
    const sanitizedTestimonial = {
      id: testimonial._id.toString(),
      type: testimonial.type,
      authorName: sanitizeHtml(testimonial.authorName || 'Anonymous'),
      content: sanitizeHtml(testimonial.content || ''),
      rating: testimonial.rating,
      mediaUrl: testimonial.mediaUrl,
      thumbnailUrl: testimonial.thumbnailUrl,
      questionResponses: testimonial.questionResponses || [],
      createdAt: testimonial.createdAt
    };

    // Generate HTML based on design template
    const html = generateSingleHTML(widget, sanitizedTestimonial, theme || settings.theme);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.send(html);
  } catch (error) {
    console.error('Single embed error:', error);
    res.status(500).send(`
      <html>
        <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
          <p>Error loading widget</p>
        </body>
      </html>
    `);
  }
});

// @route   GET /embed/config/:widgetId.js
// @desc    Serve JS widget loader
// @access  Public
router.get('/config/:widgetId.js', async (req, res) => {
  try {
    const { widgetId } = req.params;

    const widget = await Widget.findById(widgetId);
    
    if (!widget || !widget.settings.isPublic) {
      return res.status(404).send('// Widget not found');
    }

    const js = `
      (function() {
        var widgetId = '${widgetId}';
        var widgetType = '${widget.type}';
        var containerId = 'trustimonials-' + widgetType + '-' + widgetId;
        var container = document.getElementById(containerId);
        
        if (!container) {
          console.error('Trustimonials widget container not found: ' + containerId);
          return;
        }
        
        var iframe = document.createElement('iframe');
        iframe.src = '${req.protocol}://${req.get('host')}/embed/' + widgetType + '/' + widgetId;
        iframe.width = '100%';
        iframe.height = '400';
        iframe.frameBorder = '0';
        iframe.loading = 'lazy';
        iframe.style.border = 'none';
        
        container.appendChild(iframe);
        
        // Listen for resize messages
        window.addEventListener('message', function(event) {
          if (event.data.type === 'trustimonials-resize' && event.data.widgetId === widgetId) {
            iframe.height = event.data.height + 'px';
          }
        });
      })();
    `;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(js);
  } catch (error) {
    console.error('Config JS error:', error);
    res.status(500).send('// Error loading widget configuration');
  }
});

// Helper function to sanitize HTML
function sanitizeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Helper function to generate wall HTML
function generateWallHTML(widget, testimonials, theme) {
  const settings = widget.settings;
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  
  const css = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${isDark ? '#1a1a1a' : isMinimal ? '#ffffff' : '#f8f9fa'};
        color: ${isDark ? '#ffffff' : '#333333'};
        padding: 16px;
      }
      .wall-container { 
        max-width: 100%; 
        margin: 0 auto; 
      }
      .testimonials-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
        gap: ${settings.spacingAndGutter?.gapPx || 16}px; 
      }
      .testimonial-card { 
        background: ${isDark ? '#2d2d2d' : '#ffffff'}; 
        border-radius: ${settings.spacingAndGutter?.cardRadiusPx || 8}px; 
        padding: 20px; 
        box-shadow: ${isMinimal ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'};
        border: ${isMinimal ? '1px solid #e0e0e0' : 'none'};
      }
      .testimonial-content { 
        margin-bottom: 12px; 
        line-height: 1.5; 
      }
      .testimonial-author { 
        font-weight: 600; 
        color: ${isDark ? '#ffffff' : '#666666'}; 
        margin-bottom: 8px; 
      }
      .testimonial-rating { 
        color: #ffc107; 
        margin-bottom: 8px; 
      }
      .cta-button { 
        background: #00A676; 
        color: white; 
        padding: 8px 16px; 
        border: none; 
        border-radius: 4px; 
        cursor: pointer; 
        text-decoration: none; 
        display: inline-block; 
        margin-top: 12px; 
      }
      .cta-button:hover { 
        background: #007A53; 
      }
    </style>
  `;

  const testimonialsHTML = testimonials.map(testimonial => `
    <div class="testimonial-card">
      ${settings.showAuthor ? `<div class="testimonial-author">${testimonial.authorName}</div>` : ''}
      ${settings.showRating && testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}</div>` : ''}
      <div class="testimonial-content">${testimonial.content}</div>
      ${testimonial.questionResponses && testimonial.questionResponses.length > 0 ? `
        <div class="question-responses">
          ${testimonial.questionResponses.slice(0, 2).map(response => `
            <div style="margin-bottom: 8px;">
              <strong>Q:</strong> ${response.question}<br>
              <strong>A:</strong> ${response.answer}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  const ctaHTML = settings.cta && settings.cta.text ? `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${settings.cta.url || '#'}" class="cta-button">${settings.cta.text}</a>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${widget.name}</title>
        ${css}
      </head>
      <body>
        <div class="wall-container">
          <div class="testimonials-grid">
            ${testimonialsHTML}
          </div>
          ${ctaHTML}
        </div>
      </body>
    </html>
  `;
}

// Helper function to generate single HTML
function generateSingleHTML(widget, testimonial, theme) {
  const settings = widget.settings;
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  
  const css = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${isDark ? '#1a1a1a' : isMinimal ? '#ffffff' : '#f8f9fa'};
        color: ${isDark ? '#ffffff' : '#333333'};
        padding: 16px;
      }
      .single-container { 
        max-width: 100%; 
        margin: 0 auto; 
      }
      .testimonial-card { 
        background: ${isDark ? '#2d2d2d' : '#ffffff'}; 
        border-radius: 8px; 
        padding: 24px; 
        box-shadow: ${isMinimal ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'};
        border: ${isMinimal ? '1px solid #e0e0e0' : 'none'};
        text-align: center;
      }
      .testimonial-content { 
        font-size: 18px; 
        line-height: 1.6; 
        margin-bottom: 16px; 
        font-style: italic;
      }
      .testimonial-author { 
        font-weight: 600; 
        color: ${isDark ? '#ffffff' : '#666666'}; 
        margin-bottom: 8px; 
      }
      .testimonial-rating { 
        color: #ffc107; 
        margin-bottom: 8px; 
      }
      .cta-button { 
        background: #00A676; 
        color: white; 
        padding: 12px 24px; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer; 
        text-decoration: none; 
        display: inline-block; 
        margin-top: 16px; 
      }
      .cta-button:hover { 
        background: #007A53; 
      }
    </style>
  `;

  const ctaHTML = settings.cta && settings.cta.text ? `
    <div style="text-align: center; margin-top: 20px;">
      <a href="${settings.cta.url || '#'}" class="cta-button">${settings.cta.text}</a>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${widget.name}</title>
        ${css}
      </head>
      <body>
        <div class="single-container">
          <div class="testimonial-card">
            <div class="testimonial-content">"${testimonial.content}"</div>
            ${settings.showAuthorDetails ? `<div class="testimonial-author">— ${testimonial.authorName}</div>` : ''}
            ${settings.showRating && testimonial.rating ? `<div class="testimonial-rating">${'★'.repeat(testimonial.rating)}</div>` : ''}
            ${settings.showDate ? `<div style="color: #999; font-size: 14px;">${new Date(testimonial.createdAt).toLocaleDateString()}</div>` : ''}
          </div>
          ${ctaHTML}
        </div>
      </body>
    </html>
  `;
}

module.exports = router;
