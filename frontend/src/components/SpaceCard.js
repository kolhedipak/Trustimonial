import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Video, Star, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

const SpaceCard = ({ 
  space, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const navigate = useNavigate();
  const { name, description, createdAt, stats } = space;
  const handleViewSpace = () => {
    if (!space.id) return;
    const sanitizedId = space.id.toString().split(':')[0]; // Take only the base ID part
    navigate(`/spaces/${sanitizedId}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article 
      className="card p-6 hover:shadow-lg transition-shadow duration-200"
      aria-label={`Space: ${name}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
              {description}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Created {formatDate(createdAt)}
          </p>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleViewSpace}
            className="p-2 text-neutral-400 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-100"
            aria-label={`View ${name}`}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(space)}
            className="p-2 text-neutral-400 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-100"
            aria-label={`Edit ${name}`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(space)}
            className="p-2 text-neutral-400 hover:text-danger transition-colors duration-200 rounded-lg hover:bg-red-50"
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Video className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">
              {stats?.videos || 0}
            </span>
          </div>
          <p className="text-xs text-neutral-500">Videos</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">
              {stats?.testimonials || 0}
            </span>
          </div>
          <p className="text-xs text-neutral-500">Testimonials</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-900">
              {stats?.activeShareLinks || 0}
            </span>
          </div>
          <p className="text-xs text-neutral-500">Links</p>
        </div>
      </div>
    </article>
  );
};

export default SpaceCard;
