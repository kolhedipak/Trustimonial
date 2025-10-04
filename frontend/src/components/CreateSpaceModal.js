import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Users, FileText } from 'lucide-react';
import { templatesAPI } from '../utils/api';
import toast from 'react-hot-toast';

const CreateSpaceModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  const watchExpiryDate = watch('expiryDate');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      reset();
    }
  }, [isOpen, reset]);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await templatesAPI.getTemplates();
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      onClose();
      reset();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                Create New Space
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Space Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  Space Name *
                </label>
                <input
                  {...register('name', {
                    required: 'Space name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 80,
                      message: 'Name cannot exceed 80 characters'
                    }
                  })}
                  type="text"
                  className="form-input"
                  placeholder="Enter space name"
                  autoFocus
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <textarea
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description cannot exceed 500 characters'
                    }
                  })}
                  rows={3}
                  className="form-input"
                  placeholder="Describe what this space is for"
                />
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
                <p className="form-helper">
                  Help your team understand the purpose of this space
                </p>
              </div>

              {/* Template Selection */}
              <div>
                <label htmlFor="templateId" className="form-label">
                  Template (Optional)
                </label>
                <select
                  {...register('templateId')}
                  className="form-input"
                  disabled={loadingTemplates}
                >
                  <option value="">No template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {loadingTemplates && (
                  <p className="form-helper">Loading templates...</p>
                )}
                <p className="form-helper">
                  Choose a template to pre-configure the testimonial form
                </p>
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="expiryDate" className="form-label">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Expiry Date (Optional)
                </label>
                <input
                  {...register('expiryDate', {
                    validate: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selectedDate > today || 'Expiry date must be in the future';
                    }
                  })}
                  type="date"
                  min={getMinDate()}
                  className="form-input"
                />
                {errors.expiryDate && (
                  <p className="form-error">{errors.expiryDate.message}</p>
                )}
                <p className="form-helper">
                  When should this space stop accepting new testimonials?
                </p>
              </div>

              {/* Max Uses */}
              <div>
                <label htmlFor="maxUses" className="form-label">
                  <Users className="w-4 h-4 inline mr-1" />
                  Maximum Uses (Optional)
                </label>
                <input
                  {...register('maxUses', {
                    min: {
                      value: 1,
                      message: 'Maximum uses must be at least 1'
                    },
                    pattern: {
                      value: /^\d+$/,
                      message: 'Maximum uses must be a number'
                    }
                  })}
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Unlimited"
                />
                {errors.maxUses && (
                  <p className="form-error">{errors.maxUses.message}</p>
                )}
                <p className="form-helper">
                  Limit how many testimonials can be submitted to this space
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 bg-neutral-50 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{loading ? 'Creating...' : 'Create Space'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModal;
