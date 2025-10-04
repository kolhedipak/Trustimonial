import React, { useState, useEffect } from 'react';
import { Plus, Upload, Video, MessageSquare, Check, Archive, ArchiveRestore, Flag, Trash2, Download } from 'lucide-react';
import TestimonialCard from './TestimonialCard';
import { dashboardAPI } from '../utils/api';
import toast from 'react-hot-toast';

const TestimonialsInbox = ({ 
  spaceId, 
  filter, 
  onAddVideo, 
  onAddText, 
  onBulkImport,
  onEditSpace 
}) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonials, setSelectedTestimonials] = useState(new Set());
  const [bulkActionsVisible, setBulkActionsVisible] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, [spaceId, filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSpaceTestimonials(spaceId, { filter });
      setTestimonials(response.data.testimonials || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTestimonial = (testimonialId, selected) => {
    const newSelected = new Set(selectedTestimonials);
    if (selected) {
      newSelected.add(testimonialId);
    } else {
      newSelected.delete(testimonialId);
    }
    setSelectedTestimonials(newSelected);
    setBulkActionsVisible(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedTestimonials.size === testimonials.length) {
      setSelectedTestimonials(new Set());
      setBulkActionsVisible(false);
    } else {
      setSelectedTestimonials(new Set(testimonials.map(t => t.id)));
      setBulkActionsVisible(true);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTestimonials.size === 0) return;

    try {
      const testimonialIds = Array.from(selectedTestimonials);
      
      switch (action) {
        case 'approve':
          await dashboardAPI.bulkActionTestimonials(spaceId, testimonialIds, 'approve');
          toast.success(`${testimonialIds.length} testimonials approved`);
          break;
        case 'archive':
          await dashboardAPI.bulkActionTestimonials(spaceId, testimonialIds, 'archive');
          toast.success(`${testimonialIds.length} testimonials archived`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${testimonialIds.length} testimonials?`)) {
            await dashboardAPI.bulkActionTestimonials(spaceId, testimonialIds, 'delete');
            toast.success(`${testimonialIds.length} testimonials deleted`);
          }
          break;
        case 'export':
          // TODO: Implement export functionality
          toast('Export functionality coming soon');
          break;
      }

      // Refresh testimonials and clear selection
      await fetchTestimonials();
      setSelectedTestimonials(new Set());
      setBulkActionsVisible(false);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} testimonials`);
    }
  };

  const handleTestimonialAction = async (testimonial, action) => {
    try {
      await dashboardAPI.actionTestimonial(spaceId, testimonial.id, action);
      toast.success(`Testimonial ${action}d successfully`);
      await fetchTestimonials();
    } catch (error) {
      console.error(`Error ${action}ing testimonial:`, error);
      toast.error(`Failed to ${action} testimonial`);
    }
  };

  const handleUnarchive = (testimonial) => handleTestimonialAction(testimonial, 'unarchive');
  const handleMarkAsSpam = (testimonial) => handleTestimonialAction(testimonial, 'spam');

  // Empty State
  if (!loading && testimonials.length === 0) {
    return (
      <div className="flex-1 bg-muted-surface p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-neutral-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">No testimonials yet</h2>
          
          <p className="text-neutral-600 mb-8">
            Share your Space link to collect testimonials or import existing ones.
          </p>

          <div className="space-y-3">
            <button
              onClick={onAddVideo}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cta hover:bg-cta-600 focus:outline-none focus:ring-3 focus:ring-focus-ring min-h-[var(--hit-target-size)]"
            >
              <Video className="w-5 h-5 mr-2" />
              Add a video
            </button>
            
            <button
              onClick={onAddText}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 bg-surface hover:bg-primary-50 focus:outline-none focus:ring-3 focus:ring-focus-ring min-h-[var(--hit-target-size)]"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Add a text
            </button>
            
            <button
              onClick={onBulkImport}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-neutral-300 text-base font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring min-h-[var(--hit-target-size)]"
            >
              <Upload className="w-5 h-5 mr-2" />
              Bulk import
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex-1 bg-muted-surface p-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-neutral-300 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-neutral-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List State
  return (
    <div className="flex-1 bg-muted-surface flex flex-col">
      {/* Header with bulk actions */}
      <div className="bg-surface border-b border-neutral-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedTestimonials.size === testimonials.length && testimonials.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-300"
              aria-label="Select all testimonials"
            />
            <span className="text-sm text-neutral-600">
              {selectedTestimonials.size > 0 
                ? `${selectedTestimonials.size} selected` 
                : `${testimonials.length} testimonials`
              }
            </span>
          </div>

          {bulkActionsVisible && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success hover:bg-success-600 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <Archive className="w-4 h-4 mr-1" />
                Archive
              </button>
              <button
                onClick={() => handleBulkAction('unarchive')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <ArchiveRestore className="w-4 h-4 mr-1" />
                Unarchive
              </button>
              <button
                onClick={() => handleBulkAction('spam')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <Flag className="w-4 h-4 mr-1" />
                Mark as spam
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="inline-flex items-center px-3 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-surface hover:bg-neutral-50 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger hover:bg-danger-600 focus:outline-none focus:ring-3 focus:ring-focus-ring"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Testimonials List */}
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              isSelected={selectedTestimonials.has(testimonial.id)}
              onSelect={(selected) => handleSelectTestimonial(testimonial.id, selected)}
              onView={(testimonial) => console.log('View testimonial:', testimonial)}
              onApprove={(testimonial) => handleTestimonialAction(testimonial, 'approve')}
              onReject={(testimonial) => handleTestimonialAction(testimonial, 'reject')}
              onEdit={(testimonial) => console.log('Edit testimonial:', testimonial)}
              onShare={(testimonial) => console.log('Share testimonial:', testimonial)}
              onArchive={(testimonial) => handleTestimonialAction(testimonial, 'archive')}
              onUnarchive={handleUnarchive}
              onMarkAsSpam={handleMarkAsSpam}
              onDelete={(testimonial) => handleTestimonialAction(testimonial, 'delete')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsInbox;

