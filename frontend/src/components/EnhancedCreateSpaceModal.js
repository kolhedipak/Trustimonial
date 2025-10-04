import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { dashboardAPI, uploadsAPI } from '../utils/api';
import LivePreview from './LivePreview';
import ColorPicker from './ColorPicker';
import toast from 'react-hot-toast';

const EnhancedCreateSpaceModal = ({ isOpen, onClose, onSubmit, loading = false, editingSpace = null }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
    getValues
  } = useForm({
    defaultValues: {
      name: editingSpace?.name || '',
      headerTitle: editingSpace?.headerTitle || 'Share your experience',
      headerMessage: editingSpace?.headerMessage || "We'd love to hear about your experience with our product. Your feedback helps us improve and helps others make informed decisions.",
      questionList: editingSpace?.questionList || [
        "Who are you, and what are you working on?",
        "How has our product helped you?",
        "What is the best thing about our product?"
      ],
      collectExtras: editingSpace?.collectExtras || [],
      collectionType: editingSpace?.collectionType || 'text-and-video',
      theme: editingSpace?.theme || 'light',
      buttonColor: editingSpace?.buttonColor || '#00A676',
      language: editingSpace?.language || 'en',
      autoTranslate: editingSpace?.autoTranslate || false,
      extraQuestionType: 'text'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionList'
  });

  // Watch form values for live preview
  const watchedValues = watch();
  const { name, headerTitle, headerMessage, questionList, collectExtras, collectionType, theme, buttonColor, language } = watchedValues;

  // Debounced preview update
  const [previewValues, setPreviewValues] = useState(watchedValues);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewValues(watchedValues);
    }, 300);

    return () => clearTimeout(timer);
  }, [watchedValues]);

  useEffect(() => {
    if (isOpen) {
      if (editingSpace) {
        // Populate form with editing space data
        reset({
          name: editingSpace.name || '',
          headerTitle: editingSpace.headerTitle || 'Share your experience',
          headerMessage: editingSpace.headerMessage || "We'd love to hear about your experience with our product. Your feedback helps us improve and helps others make informed decisions.",
          questionList: editingSpace.questionList || [
            "Who are you, and what are you working on?",
            "How has our product helped you?",
            "What is the best thing about our product?"
          ],
          collectExtras: editingSpace.collectExtras || [],
          collectionType: editingSpace.collectionType || 'text-and-video',
          theme: editingSpace.theme || 'light',
          buttonColor: editingSpace.buttonColor || '#00A676',
          language: editingSpace.language || 'en',
          autoTranslate: editingSpace.autoTranslate || false,
          extraQuestionType: 'text'
        });
        // Set logo preview if exists
        setLogoPreview(editingSpace.logo || null);
      } else {
        // Reset form for new space
        reset();
        setLogoPreview(null);
      }
      setLogoFile(null);
    }
  }, [isOpen, reset, editingSpace]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Logo must be smaller than 2MB');
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const addQuestion = () => {
    if (fields.length < 5) {
      append('');
    }
  };

  const removeQuestion = (index) => {
    if (fields.length > 1) {
      const question = questionList[index];
      if (question && question.trim()) {
        if (window.confirm('Are you sure you want to remove this question?')) {
          remove(index);
        }
      } else {
        remove(index);
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      let logoUrl = null;
      
      // Upload logo if present
      if (logoFile) {
        setIsUploading(true);
        const uploadResponse = await uploadsAPI.uploadImage(logoFile);
        logoUrl = uploadResponse.data.file.url;
      }

      // Prepare space data
      const spaceData = {
        ...data,
        logo: logoUrl,
        questionList: data.questionList.filter(q => q && q.trim()),
        // Convert empty strings to undefined for optional fields
        expiryDate: data.expiryDate && data.expiryDate.trim() ? data.expiryDate : undefined,
        maxUses: data.maxUses && data.maxUses.trim() ? parseInt(data.maxUses) : undefined,
        // Remove fields that aren't in the backend model
        extraQuestionType: undefined
      };

      console.log('Sending space data:', JSON.stringify(spaceData, null, 2));
      
      // First try debug endpoint
      try {
        const debugResponse = await dashboardAPI.debugSpace(spaceData);
        console.log('Debug response:', JSON.stringify(debugResponse.data, null, 2));
      } catch (debugError) {
        console.error('Debug error:', debugError);
      }
      
      const response = await dashboardAPI.createSpace(spaceData);
      
      // Call parent onSubmit with response
      if (onSubmit) {
        onSubmit(response.data.space);
      }
      
      onClose();
      reset();
      setLogoPreview(null);
      setLogoFile(null);
      
      toast.success(editingSpace ? 'Space updated successfully!' : 'Space created successfully!');
    } catch (error) {
      console.error('Error creating space:', error);
      
      // Show more specific error messages
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
        const errorMessages = error.response.data.errors.map(err => `${err.param || 'Field'}: ${err.msg}`).join(', ');
        toast.error(`Validation error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(editingSpace ? 'Failed to update space. Please try again.' : 'Failed to create space. Please try again.');
      }
      
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setLogoPreview(null);
    setLogoFile(null);
  };

  const isFormValid = name && 
    name.trim().length >= 3 && 
    questionList.some(q => q && q.trim()) &&
    (!language || language.length === 2);

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
        <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900" id="modal-title">
                {editingSpace ? 'Edit Space' : 'Create a new Space'}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors duration-200 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Two Column Layout */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Live Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-neutral-900 mb-4">
                    Live preview - Testimonial page
                  </h4>
                  <div 
                    className="border border-neutral-300 rounded-lg overflow-hidden"
                    aria-live="polite"
                    aria-label="Live preview of testimonial page"
                  >
                    <LivePreview
                      headerTitle={previewValues.headerTitle}
                      headerMessage={previewValues.headerMessage}
                      questionList={previewValues.questionList}
                      collectionType={previewValues.collectionType}
                      buttonColor={previewValues.buttonColor}
                      theme={previewValues.theme}
                      collectExtras={previewValues.collectExtras}
                      logo={logoPreview}
                    />
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="space-y-6">
                  {/* Space Name */}
                  <div>
                    <label htmlFor="name" className="form-label">
                      Space name *
                    </label>
                    <input
                      {...register('name', {
                        required: 'Space name is required',
                        minLength: {
                          value: 3,
                          message: 'Name must be at least 3 characters'
                        },
                        maxLength: {
                          value: 60,
                          message: 'Name cannot exceed 60 characters'
                        }
                      })}
                      type="text"
                      className="form-input"
                      placeholder="Enter space name"
                      autoFocus
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="form-error">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="form-label">Space logo</label>
                    <div className="space-y-3">
                      {logoPreview ? (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-300"
                          />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="btn-outline text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors duration-200">
                          <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                          <span className="text-sm text-neutral-600">Upload a square logo (max 2MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Header Title */}
                  <div>
                    <label htmlFor="headerTitle" className="form-label">
                      Header title
                    </label>
                    <input
                      {...register('headerTitle', {
                        maxLength: {
                          value: 80,
                          message: 'Title cannot exceed 80 characters'
                        }
                      })}
                      type="text"
                      className="form-input"
                      placeholder="Header goes here..."
                      aria-describedby={errors.headerTitle ? 'headerTitle-error' : undefined}
                    />
                    {errors.headerTitle && (
                      <p id="headerTitle-error" className="form-error">{errors.headerTitle.message}</p>
                    )}
                  </div>

                  {/* Header Message */}
                  <div>
                    <label htmlFor="headerMessage" className="form-label">
                      Custom message
                    </label>
                    <textarea
                      {...register('headerMessage', {
                        maxLength: {
                          value: 300,
                          message: 'Message cannot exceed 300 characters'
                        }
                      })}
                      rows={3}
                      className="form-input"
                      placeholder="Write a warm message with simple instructions"
                      aria-describedby={errors.headerMessage ? 'headerMessage-error' : 'headerMessage-help'}
                    />
                    {errors.headerMessage ? (
                      <p id="headerMessage-error" className="form-error">{errors.headerMessage.message}</p>
                    ) : (
                      <p id="headerMessage-help" className="form-helper">
                        Write a warm message with simple instructions
                      </p>
                    )}
                  </div>

                  {/* Questions */}
                  <div>
                    <label className="form-label">Questions *</label>
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start space-x-2">
                          <div className="flex-1">
                            <input
                              {...register(`questionList.${index}`, {
                                required: index === 0 ? 'At least one question is required' : false,
                                maxLength: {
                                  value: 100,
                                  message: 'Question cannot exceed 100 characters'
                                }
                              })}
                              type="text"
                              className="form-input"
                              placeholder={`Question ${index + 1}`}
                              aria-describedby={errors.questionList?.[index] ? `question-${index}-error` : undefined}
                            />
                            {errors.questionList?.[index] && (
                              <p id={`question-${index}-error`} className="form-error">
                                {errors.questionList[index].message}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-2 text-neutral-400 hover:text-danger transition-colors duration-200"
                            disabled={fields.length === 1}
                            aria-label={`Remove question ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addQuestion}
                        disabled={fields.length >= 5}
                        className="btn-outline text-sm flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                      {fields.length >= 5 && (
                        <p className="text-xs text-neutral-500">Maximum 5 questions allowed</p>
                      )}
                    </div>
                  </div>

                  {/* Collection Type */}
                  <div>
                    <label className="form-label">Collection type *</label>
                    <div className="space-y-2">
                      {[
                        { value: 'text-only', label: 'Text only' },
                        { value: 'text-and-star', label: 'Text and star rating' },
                        { value: 'text-and-video', label: 'Text and video' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            {...register('collectionType', { required: true })}
                            type="radio"
                            value={option.value}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-neutral-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="form-label">Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['light', 'dark', 'minimal'].map((themeOption) => (
                        <label key={themeOption} className="flex flex-col items-center space-y-2 p-3 border border-neutral-300 rounded-lg cursor-pointer hover:border-primary transition-colors duration-200">
                          <input
                            {...register('theme')}
                            type="radio"
                            value={themeOption}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium capitalize">{themeOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Button Color */}
                  <ColorPicker
                    value={buttonColor}
                    onChange={(color) => setValue('buttonColor', color)}
                    label="Custom button color"
                  />

                  {/* Collect Extra Info */}
                  <div>
                    <label className="form-label">Collect extra info</label>
                    <div className="space-y-2">
                      {[
                        { value: 'name', label: 'Name' },
                        { value: 'email', label: 'Email' },
                        { value: 'title', label: 'Job title' },
                        { value: 'social', label: 'Website/social' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            {...register('collectExtras')}
                            type="checkbox"
                            value={option.value}
                            className="text-primary focus:ring-primary rounded"
                            onChange={(e) => {
                              const currentValues = getValues('collectExtras') || [];
                              if (e.target.checked) {
                                setValue('collectExtras', [...currentValues, option.value]);
                              } else {
                                setValue('collectExtras', currentValues.filter(v => v !== option.value));
                              }
                            }}
                          />
                          <span className="text-sm text-neutral-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label htmlFor="language" className="form-label">Language</label>
                    <input
                      {...register('language', {
                        maxLength: {
                          value: 2,
                          message: 'Language code must be exactly 2 characters'
                        },
                        pattern: {
                          value: /^[a-z]{2}$/i,
                          message: 'Language must be a 2-letter code'
                        }
                      })}
                      type="text"
                      className="form-input"
                      placeholder="en"
                      maxLength={2}
                      aria-describedby={errors.language ? 'language-error' : 'language-help'}
                    />
                    {errors.language ? (
                      <p id="language-error" className="form-error">{errors.language.message}</p>
                    ) : (
                      <p id="language-help" className="form-helper">ISO-639-1 code (e.g., en, es, fr)</p>
                    )}
                  </div>

                  {/* Auto Translate */}
                  <div className="flex items-center space-x-2">
                    <input
                      {...register('autoTranslate')}
                      type="checkbox"
                      className="text-primary focus:ring-primary rounded"
                    />
                    <label className="text-sm text-neutral-700">Auto translate</label>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Note: Machine translation may not be perfect
                  </p>

                  {/* Expiry Date */}
                  <div>
                    <label htmlFor="expiryDate" className="form-label">Expiry date</label>
                    <input
                      {...register('expiryDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="form-input"
                    />
                  </div>

                  {/* Max Uses */}
                  <div>
                    <label htmlFor="maxUses" className="form-label">Max uses</label>
                    <input
                      {...register('maxUses', {
                        min: { value: 1, message: 'Must be at least 1' }
                      })}
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Unlimited"
                    />
                    <p className="form-helper">Leave empty for unlimited</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 bg-neutral-50 border-t border-neutral-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline"
                disabled={loading || isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading || isUploading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading || isUploading ? (
                  <div className="spinner w-4 h-4"></div>
                ) : null}
                <span>
                  {loading || isUploading 
                    ? (editingSpace ? 'Updating...' : 'Creating...') 
                    : (editingSpace ? 'Update Space' : 'Create Space')
                  }
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCreateSpaceModal;
