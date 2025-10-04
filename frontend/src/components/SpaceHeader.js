import React from 'react';
import { Edit3, Video, MessageSquare, Share2 } from 'lucide-react';

const SpaceHeader = ({ 
  spaceName, 
  videoCredits, 
  textCredits, 
  onEditSpace,
  onCreditsClick,
  onShareClick 
}) => {
  return (
    <header className="bg-surface border-b border-neutral-300 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Space name */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-neutral-900" id="space-title">
            {spaceName}
          </h1>
        </div>

        {/* Right side - Credits and Edit button */}
        <div className="flex items-center space-x-4">
          {/* Video Credits */}
          <button
            onClick={onCreditsClick}
            className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
            aria-label={`${videoCredits} video credits remaining`}
          >
            <Video className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              {videoCredits} videos
            </span>
          </button>

          {/* Text Credits */}
          <button
            onClick={onCreditsClick}
            className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
            aria-label={`${textCredits} text credits remaining`}
          >
            <MessageSquare className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">
              {textCredits} text
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={onShareClick}
            className="inline-flex items-center px-4 py-2 bg-cta text-white text-sm font-medium rounded-md hover:bg-cta-600 focus:outline-none focus:ring-3 focus:ring-focus-ring min-h-[var(--hit-target-size)]"
            aria-label="Create share link"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>

          {/* Edit Space Button */}
          <button
            onClick={onEditSpace}
            className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-surface hover:bg-primary-50 focus:outline-none focus:ring-3 focus:ring-focus-ring min-h-[var(--hit-target-size)]"
            aria-label="Edit space settings"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit space
          </button>
        </div>
      </div>
    </header>
  );
};

export default SpaceHeader;

