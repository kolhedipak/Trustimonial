import React, { useState } from 'react';
import { MoreVertical, Eye, Check, X, Edit, Share, Archive, ArchiveRestore, Flag, Trash2, Play, MessageSquare, Star, ExternalLink } from 'lucide-react';

const TestimonialCard = ({
  testimonial,
  onView,
  onApprove,
  onReject,
  onEdit,
  onShare,
  onArchive,
  onUnarchive,
  onMarkAsSpam,
  onDelete,
  isSelected,
  onSelect
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-success text-white';
      case 'rejected': return 'bg-danger text-white';
      case 'pending': return 'bg-warning text-white';
      case 'archived': return 'bg-neutral-500 text-white';
      case 'spam': return 'bg-danger text-white';
      default: return 'bg-neutral-300 text-neutral-700';
    }
  };

  const getCollectedViaIcon = (via) => {
    switch (via) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'linked': return <ExternalLink className="w-4 h-4" />;
      case 'import': return <Star className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <article 
      className={`
        bg-surface border border-neutral-300 rounded-lg p-4 hover:shadow-md transition-shadow duration-200
        ${isSelected ? 'ring-2 ring-primary-300' : ''}
      `}
      aria-label={`Testimonial from ${testimonial.authorName || 'Anonymous'}`}
    >
      <div className="flex items-start space-x-4">
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-300"
            aria-label={`Select testimonial from ${testimonial.authorName || 'Anonymous'}`}
          />
        </div>

        {/* Thumbnail/Preview */}
        <div className="flex-shrink-0">
          {testimonial.type === 'video' && testimonial.thumbnailUrl ? (
            <div className="relative w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
              <img
                src={testimonial.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center">
              {testimonial.type === 'video' ? (
                <Play className="w-6 h-6 text-neutral-500" />
              ) : (
                <MessageSquare className="w-6 h-6 text-neutral-500" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Author and Rating */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-neutral-900 truncate">
                  {testimonial.authorName || 'Anonymous'}
                </h3>
                {testimonial.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-warning fill-current" />
                    <span className="text-xs text-neutral-600">{testimonial.rating}</span>
                  </div>
                )}
              </div>

              {/* Content Preview */}
              {testimonial.questionResponses && testimonial.questionResponses.length > 0 ? (
                <div className="space-y-2 mb-2">
                  {testimonial.questionResponses.slice(0, 2).map((response, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium text-neutral-700 mb-1 line-clamp-1">
                        Q: {response.question}
                      </p>
                      <p className="text-neutral-600 line-clamp-1">
                        A: {response.answer}
                      </p>
                      {response.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-warning fill-current" />
                          <span className="text-xs text-neutral-500">{response.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {testimonial.questionResponses.length > 2 && (
                    <p className="text-xs text-neutral-500">
                      +{testimonial.questionResponses.length - 2} more questions
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                  {testimonial.content || 'No content available'}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-xs text-neutral-500">
                <div className="flex items-center space-x-1">
                  {getCollectedViaIcon(testimonial.collectedVia)}
                  <span>{testimonial.collectedVia || 'Unknown'}</span>
                </div>
                <span>{formatDate(testimonial.createdAt)}</span>
              </div>
            </div>

            {/* Status Badge and Actions */}
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                {testimonial.status}
              </span>

              {/* Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
                  aria-label="More actions"
                >
                  <MoreVertical className="w-4 h-4 text-neutral-500" />
                </button>

                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-neutral-300 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onView(testimonial);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      
                      {testimonial.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              onApprove(testimonial);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              onReject(testimonial);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          onEdit(testimonial);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onShare(testimonial);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                      >
                        <Share className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      
                      {/* Conditional actions based on status */}
                      {testimonial.status === 'archived' ? (
                        <button
                          onClick={() => {
                            onUnarchive(testimonial);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                          <span>Unarchive</span>
                        </button>
                      ) : testimonial.status === 'spam' ? (
                        <button
                          onClick={() => {
                            onArchive(testimonial);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                        >
                          <Archive className="w-4 h-4" />
                          <span>Archive</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              onArchive(testimonial);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                          >
                            <Archive className="w-4 h-4" />
                            <span>Archive</span>
                          </button>
                          <button
                            onClick={() => {
                              onMarkAsSpam(testimonial);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                          >
                            <Flag className="w-4 h-4" />
                            <span>Mark as spam</span>
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          onDelete(testimonial);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2 text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TestimonialCard;

