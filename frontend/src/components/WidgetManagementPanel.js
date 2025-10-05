import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Copy, Trash2, Settings, Grid, Quote } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import WallOfLoveWidgetModal from './WallOfLoveWidgetModal';
import SingleTestimonialWidgetModal from './SingleTestimonialWidgetModal';
import toast from 'react-hot-toast';

const WidgetManagementPanel = ({ spaceId }) => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [widgetType, setWidgetType] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewWidget, setPreviewWidget] = useState(null);

  useEffect(() => {
    fetchWidgets();
  }, [spaceId]);

  const fetchWidgets = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getWidgets(spaceId);
      setWidgets(response.data.widgets || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast.error('widgets not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWidget = (type) => {
    setWidgetType(type);
    setShowCreateModal(true);
  };

  const handleWidgetCreated = () => {
    setShowCreateModal(false);
    setWidgetType(null);
    fetchWidgets();
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setWidgetType(widget.type);
    setShowCreateModal(true);
  };

  const handlePreviewWidget = (widget) => {
    setPreviewWidget(widget);
    setShowPreviewModal(true);
  };

  const handleWidgetUpdated = () => {
    setEditingWidget(null);
    setShowCreateModal(false);
    setWidgetType(null);
    fetchWidgets();
  };

  const handleCopyEmbedCode = async (widget) => {
    try {
      const embedCode = generateEmbedCode(widget);
      await navigator.clipboard.writeText(embedCode);
      toast.success('Embed code copied to clipboard!');
    } catch (error) {
      console.error('Error copying embed code:', error);
      toast.error('Failed to copy embed code');
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        await dashboardAPI.deleteWidget(widgetId);
        toast.success('Widget deleted successfully');
        fetchWidgets();
      } catch (error) {
        console.error('Error deleting widget:', error);
        toast.error('Failed to delete widget');
      }
    }
  };

  const generateEmbedCode = (widget) => {
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const iframeId = `trustimonials-${widget.type}-${widget.id}`;
    const widgetUrl = `${backendUrl}/embed/${widget.type}/${widget.id}`;
    
    return `<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.6/js/iframeResizer.min.js"></script>
<iframe id='${iframeId}' src="${widgetUrl}" frameborder="0" scrolling="no" width="100%"></iframe>
<script type="text/javascript">iFrameResize({log: false, checkOrigin: false}, '#${iframeId}');</script>`;
  };

  const getWidgetIcon = (type) => {
    return type === 'wall' ? <Grid className="w-5 h-5" /> : <Quote className="w-5 h-5" />;
  };

  const getWidgetTypeLabel = (type) => {
    return type === 'wall' ? 'Wall of Love' : 'Single Testimonial';
  };

  if (loading) {
    return (
      <div className="bg-surface border border-neutral-300 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-neutral-300 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Embed Widgets</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleCreateWidget('wall')}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
          >
            <Grid className="w-4 h-4 mr-2" />
            Wall of Love
          </button>
          <button
            onClick={() => handleCreateWidget('single')}
            className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
          >
            <Quote className="w-4 h-4 mr-2" />
            Single Testimonial
          </button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-neutral-900 mb-2">No widgets yet</h4>
          <p className="text-neutral-600 mb-4">
            Create embeddable widgets to showcase testimonials on your website.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => handleCreateWidget('wall')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cta hover:bg-cta-600 focus:outline-none focus:ring-3 focus:ring-focus-ring"
            >
              <Grid className="w-4 h-4 mr-2" />
              Create Wall of Love
            </button>
            <button
              onClick={() => handleCreateWidget('single')}
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-surface hover:bg-primary-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
            >
              <Quote className="w-4 h-4 mr-2" />
              Create Single Testimonial
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {widgets.map((widget) => (
            <div key={widget.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getWidgetIcon(widget.type)}
                  <div>
                    <h4 className="font-medium text-neutral-900">{widget.name}</h4>
                    <p className="text-sm text-neutral-600">
                      {getWidgetTypeLabel(widget.type)} • {widget.designTemplate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    widget.status === 'active' 
                      ? 'bg-success text-white' 
                      : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {widget.status}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePreviewWidget(widget)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditWidget(widget)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyEmbedCode(widget)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      title="Copy embed code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="p-2 text-neutral-500 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Widget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {editingWidget ? 'Edit' : 'Create'} {getWidgetTypeLabel(widgetType)} Widget
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingWidget(null);
                  setWidgetType(null);
                }}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {widgetType === 'wall' ? (
              <WallOfLoveWidgetModal 
                spaceId={spaceId} 
                editingWidget={editingWidget}
                onClose={() => {
                  setShowCreateModal(false);
                  setEditingWidget(null);
                  setWidgetType(null);
                }}
                onSuccess={editingWidget ? handleWidgetUpdated : handleWidgetCreated}
              />
            ) : (
              <SingleTestimonialWidgetModal 
                spaceId={spaceId} 
                editingWidget={editingWidget}
                onClose={() => {
                  setShowCreateModal(false);
                  setEditingWidget(null);
                  setWidgetType(null);
                }}
                onSuccess={editingWidget ? handleWidgetUpdated : handleWidgetCreated}
              />
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Preview: {previewWidget.name}
              </h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewWidget(null);
                }}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Widget Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {getWidgetTypeLabel(previewWidget.type)}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {previewWidget.status}
                  </div>
                  <div>
                    <span className="font-medium">Design Template:</span> {previewWidget.designTemplate}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(previewWidget.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-neutral-200 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-4">Live Preview</h4>
                <div className="border border-neutral-300 rounded-lg overflow-hidden">
                  <iframe 
                    id={`preview-${previewWidget.id}`}
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/embed/${previewWidget.type}/${previewWidget.id}`}
                    width="100%" 
                    height="400" 
                    frameborder="0"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewWidget(null);
                  }}
                  className="px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewWidget(null);
                    handleEditWidget(previewWidget);
                  }}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600"
                >
                  Edit Widget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default WidgetManagementPanel;
