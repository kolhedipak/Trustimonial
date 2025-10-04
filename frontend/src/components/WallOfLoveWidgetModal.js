import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, Copy, Grid, Layout, RotateCcw } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const WallOfLoveWidgetModal = ({ spaceId, onClose, onSuccess, editingWidget = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: editingWidget?.name || '',
      designTemplate: editingWidget?.designTemplate || 'grid-cards',
      theme: editingWidget?.settings?.theme || 'light',
      itemsToShow: editingWidget?.settings?.itemsToShow || 12,
      sortOrder: editingWidget?.settings?.sortOrder || 'newest',
      showAuthor: editingWidget?.settings?.showAuthor !== false,
      showRating: editingWidget?.settings?.showRating !== false,
      isPublic: editingWidget?.settings?.isPublic !== false,
      filter: editingWidget?.settings?.filter || {
        minRating: null,
        hasMedia: false
      },
      spacingAndGutter: editingWidget?.settings?.spacingAndGutter || {
        gapPx: 16,
        cardRadiusPx: 8
      },
      cta: editingWidget?.settings?.cta || null
    }
  });

  const watchedValues = watch();

  // Debounced preview update - only when essential values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchedValues.name && watchedValues.designTemplate) {
        generatePreview();
      }
    }, 500); // Reduced debounce time for better responsiveness

    return () => clearTimeout(timer);
  }, [watchedValues.name, watchedValues.designTemplate, watchedValues.itemsToShow, watchedValues.sortOrder, watchedValues.theme, watchedValues.showAuthor, watchedValues.showRating]);

  const generatePreview = async () => {
    try {
      // Create a temporary widget for preview
      const tempWidget = {
        name: watchedValues.name || 'Preview Widget',
        type: 'wall',
        designTemplate: watchedValues.designTemplate,
        settings: watchedValues
      };

      // Fetch real approved testimonials for preview
      const params = {
        limit: watchedValues.itemsToShow || 12,
        sortOrder: watchedValues.sortOrder || 'newest'
      };

      const response = await dashboardAPI.getApprovedTestimonials(spaceId, params);
      const testimonials = response.data.testimonials || [];

      // If no real testimonials, show mock data as fallback
      const previewTestimonials = testimonials.length > 0 ? testimonials : [
        {
          id: '1',
          type: 'text',
          authorName: 'Sarah Johnson',
          content: 'This product has completely transformed how we work. The team loves it!',
          rating: 5,
          questionResponses: [
            { question: 'How has our product helped you?', answer: 'It has streamlined our workflow significantly.' }
          ],
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'text',
          authorName: 'Mike Chen',
          content: 'Excellent customer service and a great product. Highly recommended!',
          rating: 4,
          questionResponses: [],
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'text',
          authorName: 'Emily Davis',
          content: 'The best investment we\'ve made for our business this year.',
          rating: 5,
          questionResponses: [],
          createdAt: new Date()
        }
      ];

      // Generate preview URL for iframe
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const previewParams = new URLSearchParams({
        theme: watchedValues.theme || 'light',
        designTemplate: watchedValues.designTemplate || 'grid-cards',
        testimonials: JSON.stringify(previewTestimonials)
      });
      const previewUrl = `${backendUrl}/embed/wall/preview?${previewParams.toString()}`;

      setPreviewData({
        widget: tempWidget,
        testimonials: previewTestimonials,
        previewUrl: previewUrl
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback to mock data on error
      const fallbackWidget = {
        name: watchedValues.name || 'Preview Widget',
        type: 'wall',
        designTemplate: watchedValues.designTemplate,
        settings: watchedValues
      };
      
      const fallbackTestimonials = [
        {
          id: '1',
          type: 'text',
          authorName: 'Sarah Johnson',
          content: 'This product has completely transformed how we work. The team loves it!',
          rating: 5,
          questionResponses: [
            { question: 'How has our product helped you?', answer: 'It has streamlined our workflow significantly.' }
          ],
          createdAt: new Date()
        },
        {
          id: '2',
          type: 'text',
          authorName: 'Mike Chen',
          content: 'Excellent customer service and a great product. Highly recommended!',
          rating: 4,
          questionResponses: [],
          createdAt: new Date()
        },
        {
          id: '3',
          type: 'text',
          authorName: 'Emily Davis',
          content: 'The best investment we\'ve made for our business this year.',
          rating: 5,
          questionResponses: [],
          createdAt: new Date()
        }
      ];

      // Generate preview URL for iframe
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const previewParams = new URLSearchParams({
        theme: watchedValues.theme || 'light',
        designTemplate: watchedValues.designTemplate || 'grid-cards',
        testimonials: JSON.stringify(fallbackTestimonials)
      });
      const previewUrl = `${backendUrl}/embed/wall/preview?${previewParams.toString()}`;

      setPreviewData({
        widget: fallbackWidget,
        testimonials: fallbackTestimonials,
        previewUrl: previewUrl
      });
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const widgetData = {
        name: data.name,
        type: 'wall',
        designTemplate: data.designTemplate,
        settings: {
          theme: data.theme,
          itemsToShow: data.itemsToShow,
          sortOrder: data.sortOrder,
          showAuthor: data.showAuthor,
          showRating: data.showRating,
          isPublic: data.isPublic,
          filter: data.filter,
          spacingAndGutter: data.spacingAndGutter,
          cta: null
        }
      };

      let response;
      if (editingWidget) {
        // Update existing widget
        response = await dashboardAPI.updateWidget(editingWidget.id, widgetData);
        toast.success('Wall of Love widget updated successfully!');
      } else {
        // Create new widget
        response = await dashboardAPI.createWidget(spaceId, widgetData);
        toast.success('Wall of Love widget created successfully!');
        
        // Show iframe copy option after creation
        setTimeout(() => {
          handleCopyEmbedCode(response.data.widget.id);
        }, 1000);
      }
      
      onSuccess(response.data.widget);
    } catch (error) {
      console.error('Error saving widget:', error);
      
      // Show more specific error messages
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.details) {
        toast.error(error.response.data.details);
      } else {
        toast.error(`Failed to ${editingWidget ? 'update' : 'create'} widget`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmbedCode = (widgetId) => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const iframeId = `trustimonial-wall-${widgetId}`;
    const embedCode = `<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.6/js/iframeResizer.min.js"></script>
<iframe id='${iframeId}' src="${backendUrl}/embed/wall/${widgetId}" frameborder="0" scrolling="no" width="100%"></iframe>
<script type="text/javascript">iFrameResize({log: false, checkOrigin: false}, '#${iframeId}');</script>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Iframe code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
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
                Responsive preview across different screen sizes
              </div>
              
              {/* Mobile Preview */}
              <div className="mb-4">
                <div className="text-xs text-neutral-500 mb-2">Mobile (320px)</div>
                <div className="w-80 mx-auto border border-neutral-200 rounded overflow-hidden">
                  <iframe
                    src={previewData.previewUrl}
                    width="320"
                    height="400"
                    frameBorder="0"
                    scrolling="no"
                    style={{ border: 'none' }}
                    title="Mobile Preview"
                  />
                </div>
              </div>

              {/* Desktop Preview */}
              <div>
                <div className="text-xs text-neutral-500 mb-2">Desktop (800px)</div>
                <div className="border border-neutral-200 rounded overflow-hidden">
                  <iframe
                    src={previewData.previewUrl}
                    width="800"
                    height="500"
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
                  placeholder="My Wall of Love"
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
                    { value: 'grid-cards', label: 'Grid Cards', icon: Grid },
                    { value: 'masonry', label: 'Masonry', icon: Layout },
                    { value: 'carousel', label: 'Carousel', icon: RotateCcw }
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

            {/* Display Settings */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-neutral-900">Display Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Items to Show
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  {...register('itemsToShow', { 
                    min: { value: 1, message: 'Minimum 1 item' },
                    max: { value: 50, message: 'Maximum 50 items' }
                  })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.itemsToShow && (
                  <p className="mt-1 text-sm text-danger">{errors.itemsToShow.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Sort Order
                </label>
                <select
                  {...register('sortOrder')}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest_rating">Highest Rating</option>
                  <option value="random">Random</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showAuthor')}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show author names</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('showRating')}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-neutral-700">Show ratings</span>
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

export default WallOfLoveWidgetModal;
