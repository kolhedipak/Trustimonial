import React from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import SpaceCard from './SpaceCard';

const SpacesPanel = ({ 
  spaces = [], 
  onCreateSpace, 
  onEditSpace, 
  onDeleteSpace, 
  onViewSpace,
  loading = false 
}) => {
  const EmptyState = () => (
    <div className="text-center py-12" role="status" aria-live="polite">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FolderOpen className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No spaces yet
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Create your first space to start collecting testimonials from customers and teammates.
      </p>
      <button
        onClick={onCreateSpace}
        className="btn-primary inline-flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Create a new space</span>
      </button>
      <p className="text-xs text-neutral-500 mt-3">
        Spaces let you group requests, manage templates, and embed widgets.
      </p>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-neutral-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded mb-2 w-full"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
            </div>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-neutral-200 rounded"></div>
              <div className="w-8 h-8 bg-neutral-200 rounded"></div>
              <div className="w-8 h-8 bg-neutral-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
            <div className="text-center">
              <div className="h-4 bg-neutral-200 rounded mb-1"></div>
              <div className="h-3 bg-neutral-200 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-4 bg-neutral-200 rounded mb-1"></div>
              <div className="h-3 bg-neutral-200 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-4 bg-neutral-200 rounded mb-1"></div>
              <div className="h-3 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Spaces</h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (spaces.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Spaces</h2>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Spaces</h2>
        <button
          onClick={onCreateSpace}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Space</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onEdit={onEditSpace}
            onDelete={onDeleteSpace}
            onView={onViewSpace}
          />
        ))}
      </div>
    </div>
  );
};

export default SpacesPanel;
