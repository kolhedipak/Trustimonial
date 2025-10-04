import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { publicAPI, testimonialsAPI } from '../utils/api';
import { Star, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TestimonialSubmission = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const watchedImages = watch('images');

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        const response = await publicAPI.getPublicLink(slug);
        setLinkData(response.data.link);
      } catch (error) {
        console.error('Error fetching link data:', error);
        if (error.response?.status === 404) {
          toast.error('Testimonial link not found');
        } else if (error.response?.status === 410) {
          toast.error('This testimonial link has expired or reached its usage limit');
        } else {
          toast.error('Failed to load testimonial form');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLinkData();
  }, [slug]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const testimonialData = {
        ...data,
        rating: rating || undefined,
        sourceLink: slug
      };

      await testimonialsAPI.createTestimonial(testimonialData);
      setSubmitted(true);
      toast.success('Thank you for your testimonial!');
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast.error('Failed to submit testimonial. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Only image files (JPEG, PNG, GIF, WebP) are allowed');
      return;
    }

    setValue('images', files);
  };

  const handleRatingClick = (value) => {
    setRating(value);
    setValue('rating', value);
  };

  const handleRatingHover = (value) => {
    setHoverRating(value);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Link Not Found</h1>
          <p className="text-neutral-700 mb-4">This testimonial link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted-surface">
        <div className="max-w-md w-full text-center">
          <div className="card p-8">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Thank You!</h1>
            <p className="text-neutral-700 mb-6">
              Your testimonial has been submitted successfully. We appreciate your feedback!
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Share Your Experience
          </h1>
          <p className="text-neutral-700">
            Help others by sharing your honest feedback
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="authorName" className="form-label">
                Your Name *
              </label>
              <input
                {...register('authorName', {
                  required: 'Name is required',
                  minLength: {
                    value: 1,
                    message: 'Name is required'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Name cannot exceed 100 characters'
                  }
                })}
                type="text"
                className="form-input"
                placeholder="Enter your full name"
              />
              {errors.authorName && (
                <p className="form-error">{errors.authorName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="authorEmail" className="form-label">
                Email Address (Optional)
              </label>
              <input
                {...register('authorEmail', {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email (optional)"
              />
              {errors.authorEmail && (
                <p className="form-error">{errors.authorEmail.message}</p>
              )}
              <p className="form-helper">
                We won't share your email with anyone
              </p>
            </div>

            <div>
              <label className="form-label">
                Rating (Optional)
              </label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rating-star ${
                      value <= (hoverRating || rating) ? 'active' : ''
                    }`}
                    onClick={() => handleRatingClick(value)}
                    onMouseEnter={() => handleRatingHover(value)}
                    onMouseLeave={handleRatingLeave}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
              <p className="form-helper">
                Click on the stars to rate your experience
              </p>
            </div>

            <div>
              <label htmlFor="content" className="form-label">
                Your Testimonial *
              </label>
              <textarea
                {...register('content', {
                  required: 'Testimonial content is required',
                  minLength: {
                    value: 10,
                    message: 'Testimonial must be at least 10 characters'
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Testimonial cannot exceed 2000 characters'
                  }
                })}
                rows={6}
                className="form-input"
                placeholder="Share your experience in detail..."
              />
              {errors.content && (
                <p className="form-error">{errors.content.message}</p>
              )}
              <p className="form-helper">
                Minimum 10 characters, maximum 2000 characters
              </p>
            </div>

            <div>
              <label htmlFor="images" className="form-label">
                Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors duration-200">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <label htmlFor="images" className="cursor-pointer">
                  <span className="text-primary font-medium">Click to upload images</span>
                  <span className="text-neutral-500"> or drag and drop</span>
                </label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-neutral-500 mt-2">
                  PNG, JPG, GIF, WebP up to 5MB each (max 5 images)
                </p>
              </div>
              {watchedImages && watchedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-neutral-700 mb-2">
                    Selected images ({watchedImages.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchedImages.map((file, index) => (
                      <div key={index} className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex justify-center items-center"
            >
              {submitting ? (
                <div className="spinner w-5 h-5 mr-2"></div>
              ) : null}
              {submitting ? 'Submitting...' : 'Submit Testimonial'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSubmission;
