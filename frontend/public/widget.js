(function() {
  'use strict';

  // Configuration
  const API_BASE = 'http://localhost:5000';
  const WIDGET_ID = 'trustimonials-widget';

  // Initialize widget when DOM is ready
  function init() {
    const widgets = document.querySelectorAll(`#${WIDGET_ID}`);
    widgets.forEach(createWidget);
  }

  // Create individual widget
  function createWidget(container) {
    const theme = container.dataset.theme || 'light';
    const maxHeight = container.dataset.maxHeight || '400px';
    const source = container.dataset.source || '';

    // Create widget HTML
    container.innerHTML = `
      <div class="trustimonials-container" style="max-height: ${maxHeight}; overflow-y: auto;">
        <div class="trustimonials-loading" style="text-align: center; padding: 20px;">
          Loading testimonials...
        </div>
      </div>
    `;

    // Load testimonials
    loadTestimonials(container, theme, source);
  }

  // Load testimonials from API
  async function loadTestimonials(container, theme, source) {
    try {
      const response = await fetch(`${API_BASE}/api/testimonials?status=approved&limit=10`);
      const data = await response.json();
      
      if (data.testimonials && data.testimonials.length > 0) {
        renderTestimonials(container, data.testimonials, theme);
      } else {
        renderNoTestimonials(container, theme);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      renderError(container, theme);
    }
  }

  // Render testimonials
  function renderTestimonials(container, testimonials, theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#0F1724';
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#D1D5DB';
    const accentColor = '#FFB86B';

    const testimonialsHTML = testimonials.map(testimonial => `
      <div class="trustimonial-item" style="
        padding: 16px;
        border-bottom: 1px solid ${borderColor};
        margin-bottom: 0;
      ">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="
            width: 40px;
            height: 40px;
            background: #0B78D1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            flex-shrink: 0;
          ">
            ${testimonial.authorName.charAt(0).toUpperCase()}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <strong style="color: ${textColor}; font-size: 14px;">${testimonial.authorName}</strong>
              ${testimonial.rating ? renderStars(testimonial.rating, accentColor) : ''}
            </div>
            <p style="
              color: ${isDark ? '#d1d5db' : '#6b7280'};
              font-size: 14px;
              line-height: 1.5;
              margin: 0;
            ">${testimonial.content}</p>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="trustimonials-container" style="
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 8px;
        max-height: ${container.dataset.maxHeight || '400px'};
        overflow-y: auto;
      ">
        ${testimonialsHTML}
      </div>
    `;
  }

  // Render stars
  function renderStars(rating, color) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<span style="color: ${i <= rating ? color : '#d1d5db'}; font-size: 12px;">★</span>`;
    }
    return `<div style="display: flex; gap: 2px;">${stars}</div>`;
  }

  // Render no testimonials state
  function renderNoTestimonials(container, theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#0F1724';
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#D1D5DB';

    container.innerHTML = `
      <div class="trustimonials-container" style="
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        color: ${textColor};
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
        <p style="margin: 0; font-size: 14px;">No testimonials available</p>
      </div>
    `;
  }

  // Render error state
  function renderError(container, theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#ffffff' : '#0F1724';
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#D1D5DB';

    container.innerHTML = `
      <div class="trustimonials-container" style="
        background: ${bgColor};
        border: 1px solid ${borderColor};
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        color: ${textColor};
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
        <p style="margin: 0; font-size: 14px;">Unable to load testimonials</p>
      </div>
    `;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
