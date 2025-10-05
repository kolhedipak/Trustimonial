import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Video, 
  Star, 
  MessageSquare, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  User,
  Mail,
  Briefcase,
  Link as LinkIcon
} from 'lucide-react';
import { shareLinksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PublicSubmissionPage = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [space, setSpace] = useState(null);
  const [shareLink, setShareLink] = useState(null);
  const [error, setError] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      content: '',
      rating: 5
    }
  });

  const collectionType = space?.collectionType || 'text-and-video';
  const collectExtras = space?.collectExtras || [];
  const questionList = space?.questionList || [];
  const theme = space?.theme || 'light';
  const buttonColor = space?.buttonColor || '#00A676';
  const logo = space?.logo;
  const headerTitle = space?.headerTitle || "Share your experience";
  const headerMessage = space?.headerMessage || "We'd love to hear about your experience with our product. Your feedback helps us improve and helps others make informed decisions.";

  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';

  useEffect(() => {
    if (spaceId) {
      loadSpaceData();
    }
  }, [spaceId]);

  const loadSpaceData = async () => {
    try {
      setIsLoading(true);
      const response = await shareLinksAPI.getPublicShareLink(spaceId);
      setSpace(response.data.space);
    } catch (error) {
      console.error('Error loading space:', error);
      if (error.response?.status === 404) {
        setError('This space is not available or has been deactivated.');
      } else {
        setError('Failed to load submission form. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getExtraIcon = (extra) => {
    switch (extra) {
      case 'name': return <User className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'title': return <Briefcase className="w-4 h-4" />;
      case 'social': return <LinkIcon className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getExtraLabel = (extra) => {
    switch (extra) {
      case 'name': return 'Your name';
      case 'email': return 'Email address';
      case 'title': return 'Job title';
      case 'social': return 'Website or social media';
      default: return extra;
    }
  };

  const getExtraType = (extra) => {
    switch (extra) {
      case 'email': return 'email';
      case 'social': return 'url';
      default: return 'text';
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Collect question responses
      const questionResponses = [];
      questionList.forEach((question, index) => {
        const answer = data[`question_${index}`];
        const rating = data[`rating_${index}`];
        
        if (answer && answer.trim()) {
          const response = {
            question: question,
            answer: answer.trim()
          };
          
          // Only add rating if it's a valid number
          if (rating && typeof rating === 'number' && rating >= 1 && rating <= 5) {
            response.rating = rating;
          }
          
          questionResponses.push(response);
        }
      });

      // Prepare submission data - only include non-empty fields
      const submissionData = {
        questionResponses: questionResponses,
        meta: {
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      // Add optional fields only if they have values
      if (data.name && data.name.trim()) {
        submissionData.name = data.name.trim();
      }
      if (data.email && data.email.trim()) {
        submissionData.email = data.email.trim();
      }
      if (data.content && data.content.trim()) {
        submissionData.content = data.content.trim();
      }
      if (data.rating) {
        submissionData.rating = data.rating;
      }

      // Debug logging
      console.log('Submitting data:', submissionData);
      console.log('Question responses:', questionResponses);

      // If there's a media file, we need to use FormData
      if (mediaFile) {
        const formData = new FormData();
        formData.append('mediaFile', mediaFile);
        formData.append('data', JSON.stringify(submissionData));
        
        const response = await shareLinksAPI.submitPublicTestimonial(spaceId, formData);
      } else {
        // Send as JSON for text-only submissions
        const response = await shareLinksAPI.submitPublicTestimonial(spaceId, submissionData);
      }
      
      toast.success('Thank you! Your testimonial has been submitted successfully.');
      
      // Reset form
      setMediaFile(null);
      setMediaPreview(null);
      
      // Show success state
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to submit testimonial. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading submission form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Link Not Available
          </h1>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const containerClasses = `
    ${isDark ? 'bg-neutral-800 text-white' : isMinimal ? 'bg-white' : 'bg-gradient-to-br from-primary-300/10 to-cta-600/10'}
    ${isMinimal ? 'border border-neutral-300' : ''}
    min-h-screen flex items-center justify-center p-4
  `;

  const formClasses = `
    ${isDark ? 'bg-neutral-800 text-white' : isMinimal ? 'bg-white' : 'bg-gradient-to-br from-primary-300/10 to-cta-600/10'}
    ${isMinimal ? 'border border-neutral-300' : ''}
    rounded-lg p-8 max-w-2xl w-full
  `;

  const buttonClasses = `
    inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors duration-200
    ${isDark ? 'hover:opacity-90' : 'hover:opacity-90'}
  `;

  const inputClasses = `
    w-full px-4 py-3 border rounded-lg text-sm
    ${isDark 
      ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400' 
      : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-500'
    }
    focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300
  `;

  return (
    <div className={containerClasses}>
      <div className={formClasses}>
        {/* Header */}
        <div className="text-center mb-8">
          {logo && (
            <div className="mb-4">
              <img 
                src={logo} 
                alt="Space logo" 
                className="w-16 h-16 rounded-lg mx-auto object-cover"
              />
            </div>
          )}
          <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {headerTitle}
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
            {headerMessage}
          </p>
        </div>

        {/* Privacy Notice */}
        <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 ${isDark ? 'bg-blue-900/20 border-blue-700' : ''}`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Privacy Notice:</strong> Your submission may be moderated before publication. 
                We respect your privacy and will only use your information as described in our privacy policy.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Extra Info Collection */}
          {collectExtras.length > 0 && (
            <div className="space-y-4">
              {collectExtras.map((extra, index) => (
                <div key={index}>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                    <div className="flex items-center space-x-2">
                      {getExtraIcon(extra)}
                      <span>{getExtraLabel(extra)}</span>
                    </div>
                  </label>
                  <input
                    type={getExtraType(extra)}
                    {...register(extra)}
                    className={inputClasses}
                    placeholder={`Enter your ${getExtraLabel(extra).toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {questionList.map((question, index) => (
              <div key={index}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                  Question {index + 1}
                </label>
                <p className={`text-sm mb-3 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {question}
                </p>
                {collectionType === 'text-and-star' || collectionType === 'text-and-video' ? (
                  <div className="space-y-3">
                    <textarea
                      {...register(`question_${index}`, { required: 'This question is required' })}
                      className={`${inputClasses}`}
                      rows={1}
                      placeholder="Share your thoughts..."
                    />
                    {collectionType === 'text-and-star' && (
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setValue(`rating_${index}`, star)}
                            className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= (watch(`rating_${index}`) || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : isDark ? 'text-neutral-400' : 'text-neutral-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    {...register(`question_${index}`, { required: 'This question is required' })}
                    className={`${inputClasses} `}
                    rows={1}
                    placeholder="Share your thoughts..."
                  />
                )}
              </div>
            ))}
          </div>

          {/* Media Upload (if enabled) */}
          {collectionType === 'text-and-video' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                Upload Video or Image (Optional)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors duration-200 ${
                isDark ? 'border-neutral-600 hover:border-neutral-500' : 'border-neutral-300'
              }`}>
                <input
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  {mediaPreview ? (
                    <div className="space-y-4">
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="max-w-xs mx-auto rounded-lg"
                      />
                      <p className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        Click to change media
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                        isDark ? 'bg-neutral-700' : 'bg-neutral-100'
                      }`}>
                        <Upload className={`w-8 h-8 ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                          Upload a video or image
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Drag and drop or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {collectionType === 'text-and-video' && (
              <button
                type="button"
                className={`${buttonClasses} bg-neutral-600 hover:bg-neutral-700`}
                style={{ backgroundColor: buttonColor }}
                onClick={() => document.getElementById('media-upload').click()}
              >
                <Video className="w-4 h-4 mr-2" />
                Record a video
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonClasses} flex-1`}
              style={{ backgroundColor: buttonColor }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Send in text</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className={`text-xs text-center pt-4 border-t ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'}`}>
          Powered by Trustimonials • 
          <a href="/privacy" className="text-primary hover:text-primary-600 ml-1">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicSubmissionPage;
