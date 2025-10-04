import React from 'react';
import { BarChart3, Users, Video, Star } from 'lucide-react';

const OverviewCard = ({ 
  title, 
  value, 
  subvalue, 
  progressPercent, 
  ctaLabel, 
  ctaVariant = 'primary',
  onCtaClick,
  icon,
  variant = 'metric'
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (title.toLowerCase()) {
      case 'videos':
        return <Video className="w-6 h-6 text-primary" />;
      case 'spaces':
        return <Users className="w-6 h-6 text-primary" />;
      case 'testimonials':
        return <Star className="w-6 h-6 text-primary" />;
      default:
        return <BarChart3 className="w-6 h-6 text-primary" />;
    }
  };

  const getCtaClasses = () => {
    const baseClasses = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 min-h-11 min-w-11";
    
    switch (ctaVariant) {
      case 'primary':
        return `${baseClasses} bg-cta text-white hover:bg-cta-600 focus:ring-2 focus:ring-cta-600 focus:ring-offset-2`;
      case 'secondary':
        return `${baseClasses} border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2`;
      default:
        return `${baseClasses} bg-cta text-white hover:bg-cta-600 focus:ring-2 focus:ring-cta-600 focus:ring-offset-2`;
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-600 mb-1">
              {title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <strong className="text-2xl font-bold text-neutral-900">
                {value}
              </strong>
              {subvalue && (
                <span className="text-sm text-neutral-500">
                  / {subvalue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for metric variant */}
      {variant === 'metric' && progressPercent !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Usage</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-cta h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`${title} usage: ${progressPercent}%`}
            />
          </div>
        </div>
      )}

      {/* Plan Features for plan variant */}
      {variant === 'plan' && subvalue && (
        <div className="mb-4">
          <p className="text-sm text-neutral-600 mb-2">
            {subvalue}
          </p>
          <ul className="text-xs text-neutral-500 space-y-1">
            {Array.isArray(subvalue) ? subvalue.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-success rounded-full" />
                <span>{feature}</span>
              </li>
            )) : null}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      {ctaLabel && (
        <button
          onClick={onCtaClick}
          className={getCtaClasses()}
        >
          {ctaLabel}
        </button>
      )}
    </section>
  );
};

export default OverviewCard;
