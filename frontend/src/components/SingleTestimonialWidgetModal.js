import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, Copy, Square, Image, Quote } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SingleTestimonialWidgetModal = ({ spaceId, onClose, onSuccess, editingWidget = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [availableTestimonials, setAvailableTestimonials] = useState([]);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: editingWidget?.name || '',
      designTemplate: editingWidget?.designTemplate || 'card-compact',
      theme: editingWidget?.settings?.theme || 'light',
      selectTestimonial: editingWidget?.settings?.selectTestimonial || 'auto-latest',
      manualTestimonialId: editingWidget?.settings?.manualTestimonialId || '',
      showAuthorDetails: editingWidget?.settings?.showAuthorDetails !== false,
      showDate: editingWidget?.settings?.showDate || false,
      isPublic: editingWidget?.settings?.isPublic !== false,
    }
  });

  const watchedValues = watch();

  // Fetch available testimonials for manual selection
  useEffect(() => {
    if (watchedValues.selectTestimonial === 'manual-select') {
      fetchAvailableTestimonials();
    }
  }, [watchedValues.selectTestimonial, spaceId]);

  // Debounced preview update - only when essential values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues.name && watchedValues.designTemplate) {
        generatePreview();
      }
    }, 500); // Reduced debounce time for better responsiveness

    return () => clearTimeout(timer);
  }, [watchedValues.name, watchedValues.designTemplate, watchedValues.theme, watchedValues.selectTestimonial, watchedValues.showAuthorDetails, watchedValues.showDate]);

  const fetchAvailableTestimonials = async () => {
    try {
      const response = await dashboardAPI.getSpaceTestimonials(spaceId, { 
        filter: 'approved',
        limit: 50 
      });
      setAvailableTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const generatePreview = async () => {
    try {
      // Create a temporary widget for preview
      const tempWidget = {
        name: watchedValues.name || 'Preview Widget',
        type: 'single',
        designTemplate: watchedValues.designTemplate,
        settings: watchedValues
      };

      // Try to get real testimonials for preview
      let previewTestimonial = null;
      
      try {
        const response = await dashboardAPI.getApprovedTestimonials(spaceId, { limit: 1 });
        const testimonials = response.data.testimonials || [];
        
        if (testimonials.length > 0) {
          previewTestimonial = testimonials[0];
        }
      } catch (error) {
        console.error('Error fetching testimonials for preview:', error);
      }

      // Fallback to mock data if no real testimonials
      if (!previewTestimonial) {
        previewTestimonial = {
          id: '1',
          type: 'text',
          authorName: 'Sarah Johnson',
          content: 'This product has completely transformed how we work. The team loves it and we\'ve seen incredible results since implementing it.',
          rating: 5,
          questionResponses: [
            { question: 'How has our product helped you?', answer: 'It has streamlined our workflow significantly.' }
          ],
          createdAt: new Date()
        };
      }

      // Generate preview URL for iframe
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const previewParams = new URLSearchParams({
        theme: watchedValues.theme || 'light',
        designTemplate: watchedValues.designTemplate || 'card-compact',
        testimonial: JSON.stringify(previewTestimonial)
      });
      const previewUrl = `${backendUrl}/embed/single/preview?${previewParams.toString()}`;

      setPreviewData({
        widget: tempWidget,
        testimonials: [previewTestimonial],
        previewUrl: previewUrl
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback to mock data on error
      const fallbackWidget = {
        name: watchedValues.name || 'Preview Widget',
        type: 'single',
        designTemplate: watchedValues.designTemplate,
        settings: watchedValues
      };
      
      const fallbackTestimonial = {
        id: '1',
        type: 'text',
        authorName: 'Sarah Johnson',
        content: 'This product has completely transformed how we work. The team loves it and we\'ve seen incredible results since implementing it.',
        rating: 5,
        questionResponses: [
          { question: 'How has our product helped you?', answer: 'It has streamlined our workflow significantly.' }
        ],
        createdAt: new Date()
      };

      // Generate preview URL for iframe
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const previewParams = new URLSearchParams({
        theme: watchedValues.theme || 'light',
        designTemplate: watchedValues.designTemplate || 'card-compact',
        testimonial: JSON.stringify(fallbackTestimonial)
      });
      const previewUrl = `${backendUrl}/embed/single/preview?${previewParams.toString()}`;

      setPreviewData({
        widget: fallbackWidget,
        testimonials: [fallbackTestimonial],
        previewUrl: previewUrl
      });
    }
  };

  const handleCopyEmbedCode = (widgetId) => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const iframeId = `trustimonials-single-${widgetId}`;
    const embedCode = `<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.6/js/iframeResizer.min.js"></script>
<iframe id='${iframeId}' src="${backendUrl}/embed/single/${widgetId}" frameborder="0" scrolling="no" width="100%"></iframe>
<script type="text/javascript">iFrameResize({log: false, checkOrigin: false}, '#${iframeId}');</script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Iframe code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const widgetData = {
        name: data.name,
        type: 'single',
        designTemplate: data.designTemplate,
        settings: {
          theme: data.theme,
          selectTestimonial: data.selectTestimonial,
          manualTestimonialId: data.selectTestimonial === 'manual-select' ? data.manualTestimonialId : null,
          showAuthorDetails: data.showAuthorDetails,
          showDate: data.showDate,
          isPublic: data.isPublic
        }
      };

      let response;
      if (editingWidget) {
        // Update existing widget
        response = await dashboardAPI.updateWidget(editingWidget.id, widgetData);
        toast.success('Single Testimonial widget updated successfully!');
      } else {
        // Create new widget
        response = await dashboardAPI.createWidget(spaceId, widgetData);
        toast.success('Single Testimonial widget created successfully!');
        
        // Show iframe copy option after creation
        setTimeout(() => {
          handleCopyEmbedCode(response.data.widget.id);
        }, 1000);
      }
      
      onSuccess(response.data.widget);
    } catch (error) {
      console.error('Error creating widget:', error);
      
      // Show more specific error messages
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else {
        toast.error('Failed to create widget');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Preview Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-900">Live Preview</h4>
            {previewData && (
              <button
                onClick={() => handleCopyEmbedCode('preview')}
                className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                  copied ? 'bg-green-50 text-green-700 border-green-300' : 'text-neutral-700 border-neutral-300 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring'
                }`}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Iframe'}
              </button>
            )}
          </div>

          {previewData && previewData.previewUrl && (
            <div className="border border-neutral-300 rounded-lg p-4 bg-white">
              <div className="text-sm text-neutral-600 mb-4">
                Single testimonial preview
              </div>
              
              {/* Mobile Preview */}
              <div className="mb-4">
                <div className="text-xs text-neutral-500 mb-2">Mobile (320px)</div>
                <div className="w-80 mx-auto border border-neutral-200 rounded overflow-hidden">
                  <iframe
                    src={previewData.previewUrl}
                    width="320"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    style={{ border: 'none' }}
                    title="Mobile Preview"
                  />
                </div>
              </div>

              {/* Desktop Preview */}
              <div>
                <div className="text-xs text-neutral-500 mb-2">Desktop (600px)</div>
                <div className="border border-neutral-200 rounded overflow-hidden">
                  <iframe
                    src={previewData.previewUrl}
                    width="600"
                    height="300"
                    frameBorder="0"
                    scrolling="no"
                    style={{ border: 'none' }}
                    title="Desktop Preview"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Column */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-900">Basic Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Widget Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Widget name is required' })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Featured Testimonial"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Design Template
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'card-compact', label: 'Card Compact', icon: Square },
                    { value: 'hero', label: 'Hero', icon: Image },
                    { value: 'quote-overlay', label: 'Quote Overlay', icon: Quote }
                  ].map((template) => {
                    const Icon = template.icon;
                    return (
                      <label key={template.value} className="relative">
                        <input
                          type="radio"
                          value={template.value}
                          {...register('designTemplate')}
                          className="sr-only"
                        />
                        <div className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          watchedValues.designTemplate === template.value
                            ? 'border-primary bg-primary-50'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}>
                          <Icon className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                          <div className="text-xs text-center">{template.label}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Theme
                </label>
                <select
                  {...register('theme')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>

            {/* Testimonial Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-900">Testimonial Selection</h4>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  How to select testimonial
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="auto-latest"
                      {...register('selectTestimonial')}
                      className="w-4 h-4 text-primary border-neutral-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Auto - Latest approved</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="auto-random"
                      {...register('selectTestimonial')}
                      className="w-4 h-4 text-primary border-neutral-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Auto - Random approved</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manual-select"
                      {...register('selectTestimonial')}
                      className="w-4 h-4 text-primary border-neutral-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-neutral-700">Manual - Choose specific testimonial</span>
                  </label>
                </div>
              </div>

              {watchedValues.selectTestimonial === 'manual-select' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Select Testimonial *
                  </label>
                  <select
                    {...register('manualTestimonialId', { 
                      required: watchedValues.selectTestimonial === 'manual-select' ? 'Please select a testimonial' : false 
                    })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Choose a testimonial...</option>
                    {availableTestimonials.map((testimonial) => (
                      <option key={testimonial.id} value={testimonial.id}>
                        {testimonial.authorName || 'Anonymous'} - {testimonial.content?.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                  {errors.manualTestimonialId && (
                    <p className="mt-1 text-sm text-danger">{errors.manualTestimonialId.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Display Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-900">Display Settings</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showAuthorDetails')}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show author details</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showDate')}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show submission date</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isPublic')}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Make widget public</span>
                </label>
              </div>
            </div>


            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                Cancel
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopyEmbedCode('preview')}
                  className="inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cta hover:bg-cta-600 focus:outline-none focus:ring-3 focus:ring-focus-ring disabled:opacity-50"
                >
                  {isSubmitting ? (editingWidget ? 'Updating...' : 'Creating...') : (editingWidget ? 'Update Widget' : 'Create Widget')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SingleTestimonialWidgetModal;
