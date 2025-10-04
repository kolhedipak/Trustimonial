import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, Copy, Square, Image, Quote } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SingleTestimonialWidgetModal = ({ spaceId, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [availableTestimonials, setAvailableTestimonials] = useState([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      designTemplate: 'card-compact',
      theme: 'light',
      selectTestimonial: 'auto-latest',
      manualTestimonialId: '',
      showAuthorDetails: true,
      showDate: false,
      isPublic: true,
      cta: {
        text: '',
        url: '',
        style: 'button'
      }
    }
  });

  const watchedValues = watch();

  // Fetch available testimonials for manual selection
  useEffect(() => {
    if (watchedValues.selectTestimonial === 'manual-select') {
      fetchAvailableTestimonials();
    }
  }, [watchedValues.selectTestimonial, spaceId]);

  // Debounced preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues.name && watchedValues.designTemplate) {
        generatePreview();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [watchedValues]);

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

      // Mock preview data
      setPreviewData({
        widget: tempWidget,
        testimonials: [
          {
            id: '1',
            type: 'text',
            authorName: 'Sarah Johnson',
            content: 'This product has completely transformed how we work. The team loves it and we\'ve seen incredible results since implementing it.',
            rating: 5,
            questionResponses: [
              { question: 'How has our product helped you?', answer: 'It has streamlined our workflow significantly.' }
            ],
            createdAt: new Date()
          }
        ]
      });
    } catch (error) {
      console.error('Error generating preview:', error);
    }
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
          isPublic: data.isPublic,
          cta: data.cta.text ? data.cta : null
        }
      };

      const response = await dashboardAPI.createWidget(spaceId, widgetData);
      
      toast.success('Single Testimonial widget created successfully!');
      onSuccess(response.data.widget);
    } catch (error) {
      console.error('Error creating widget:', error);
      toast.error('Failed to create widget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/single/{widgetId}" width="100%" height="200" frameborder="0" loading="lazy"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-neutral-900">Preview</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {showPreview && previewData && (
            <div className="border border-neutral-300 rounded-lg p-4 bg-white">
              <div className="text-sm text-neutral-600 mb-4">
                Single testimonial preview
              </div>
              
              {/* Mobile Preview */}
              <div className="mb-4">
                <div className="text-xs text-neutral-500 mb-2">Mobile (320px)</div>
                <div className="w-80 mx-auto border border-neutral-200 rounded overflow-hidden">
                  <div className="bg-neutral-50 p-2 text-xs text-center">Mobile Preview</div>
                  <div className="p-3 bg-white">
                    <div className="text-center">
                      <div className="text-sm italic mb-2">"{previewData.testimonials[0].content}"</div>
                      <div className="text-xs font-medium">{previewData.testimonials[0].authorName}</div>
                      <div className="text-xs text-neutral-500">{'★'.repeat(previewData.testimonials[0].rating)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Preview */}
              <div>
                <div className="text-xs text-neutral-500 mb-2">Desktop (600px)</div>
                <div className="border border-neutral-200 rounded overflow-hidden">
                  <div className="bg-neutral-50 p-2 text-xs text-center">Desktop Preview</div>
                  <div className="p-6 bg-white">
                    <div className="text-center">
                      <div className="text-lg italic mb-4">"{previewData.testimonials[0].content}"</div>
                      <div className="text-sm font-medium mb-1">{previewData.testimonials[0].authorName}</div>
                      <div className="text-sm text-neutral-500">{'★'.repeat(previewData.testimonials[0].rating)}</div>
                    </div>
                  </div>
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

            {/* CTA Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-900">Call to Action</h4>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  CTA Text
                </label>
                <input
                  type="text"
                  {...register('cta.text')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Leave a testimonial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  CTA URL
                </label>
                <input
                  type="url"
                  {...register('cta.url')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://example.com/testimonials"
                />
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
                  onClick={handleCopyEmbedCode}
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
                  {isSubmitting ? 'Creating...' : 'Create Widget'}
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
