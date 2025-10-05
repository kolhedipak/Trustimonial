import React from 'react';
import { Star, Video, MessageSquare, User, Mail, Briefcase, Link as LinkIcon } from 'lucide-react';

const LivePreview = ({ 
  headerTitle = "Share your experience",
  headerMessage = "We'd love to hear about your experience with our product. Your feedback helps us improve and helps others make informed decisions.",
  questionList = [
    "Who are you, and what are you working on?",
    "How has our product helped you?",
    "What is the best thing about our product?"
  ],
  collectionType = "text-and-video",
  buttonColor = "#00A676",
  theme = "light",
  collectExtras = [],
  logo = null
}) => {
  const isDark = theme === 'dark';
  const isMinimal = theme === 'minimal';
  
  const containerClasses = `
    ${isDark ? 'bg-neutral-800 text-white' : isMinimal ? 'bg-white' : 'bg-gradient-to-br from-primary-300/10 to-cta-600/10'}
    ${isMinimal ? 'border border-neutral-300' : ''}
    rounded-lg p-6 min-h-96
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

  return (
    <div className={containerClasses}>
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
        <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          {headerTitle || "Share your experience"}
        </h2>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          {headerMessage || "We'd love to hear about your experience with our product. Your feedback helps us improve and helps others make informed decisions."}
        </p>
      </div>

      {/* Form Preview */}
      <div className="space-y-6">
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
                  type={extra === 'email' ? 'email' : 'text'}
                  className={inputClasses}
                  placeholder={`Enter your ${getExtraLabel(extra).toLowerCase()}`}
                  disabled
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
                    className={`${inputClasses}`}
                    rows={1}
                    placeholder="Share your thoughts..."
                    disabled
                  />
                  {collectionType === 'text-and-star' && (
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${isDark ? 'text-neutral-400' : 'text-neutral-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className={`${inputClasses} `}
                  rows={1}
                  placeholder="Share your thoughts..."
                  disabled
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {collectionType === 'text-and-video' && (
            <button
              className={`${buttonClasses} bg-neutral-600 hover:bg-neutral-700`}
              style={{ backgroundColor: buttonColor }}
              disabled
            >
              <Video className="w-4 h-4 mr-2" />
              Record a video
            </button>
          )}
          <button
            className={`${buttonClasses} flex-1`}
            style={{ backgroundColor: buttonColor }}
            disabled
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send in text
          </button>
        </div>

        {/* Preview Note */}
        <div className={`text-xs text-center pt-4 border-t ${isDark ? 'border-neutral-700 text-neutral-400' : 'border-neutral-200 text-neutral-500'}`}>
          This is a preview of how your testimonial page will look
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
