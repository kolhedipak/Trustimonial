import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SpaceHeader from '../components/SpaceHeader';
import Sidebar from '../components/Sidebar';
import TestimonialsInbox from '../components/TestimonialsInbox';
import WidgetManagementPanel from '../components/WidgetManagementPanel';
import EnhancedCreateSpaceModal from '../components/EnhancedCreateSpaceModal';
import { shareLinksAPI } from '../utils/api';
import toast from 'react-hot-toast';

const SpaceDetailPage = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [space, setSpace] = useState(null);
  const [credits, setCredits] = useState({ videoCredits: 0, textCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  useEffect(() => {
    if (spaceId) {
      // Clean up the ID by removing any extra parts after colon
      const sanitizedId = spaceId.toString().split(':')[0];
      fetchSpaceDetails(sanitizedId);
    }
  }, [spaceId]);
  const fetchSpaceDetails = async (id) => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSpaceDetail(id);
      setSpace(response.data.space);
      setCredits(response.data.credits);
    } catch (error) {
      console.error('Error fetching space details:', error);
      toast.error('Failed to load space details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSpace = () => {
    setEditingSpace(space);
    setShowEditModal(true);
  };

  const handleUpdateSpace = async (spaceData) => {
    try {
      const response = await dashboardAPI.updateSpace(spaceId, spaceData);
      setSpace(response.data.space);
      setShowEditModal(false);
      setEditingSpace(null);
      toast.success('Space updated successfully!');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update space');
      throw error;
    }
  };

  const handleCreditsClick = () => {
    // TODO: Open billing/usage modal
    toast('Billing modal coming soon');
  };

  const handleAddVideo = () => {
    // TODO: Open video upload/recorder flow
    toast('Video upload coming soon');
  };

  const handleAddText = () => {
    // TODO: Open text testimonial form
    toast('Text testimonial form coming soon');
  };

  const handleBulkImport = () => {
    // TODO: Open bulk import modal
    toast('Bulk import modal coming soon');
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleShareClick = async () => {
    try {
      // Generate share link directly using space ID
      const shareUrl = `${window.location.origin}/s/${spaceId}`;
      
      // Copy the link to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error copying share link:', error);
      toast.error('Failed to copy share link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted-surface">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading space details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-muted-surface">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Space not found</h2>
            <p className="text-neutral-600 mb-6">The space you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cta hover:bg-cta-600 focus:outline-none focus:ring-3 focus:ring-focus-ring"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface">
      <Header />
      
      {/* Space Header */}
      <SpaceHeader
        spaceName={space.name}
        videoCredits={credits.videoCredits}
        textCredits={credits.textCredits}
        onEditSpace={handleEditSpace}
        onCreditsClick={handleCreditsClick}
        onShareClick={handleShareClick}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-128px)]">
        {/* Sidebar */}
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Main Panel */}
        {activeFilter === 'embed-widgets' ? (
          <div className="flex-1 bg-muted-surface p-6">
            <WidgetManagementPanel spaceId={spaceId} />
          </div>
        ) : (
          <TestimonialsInbox
            spaceId={spaceId}
            filter={activeFilter}
            onAddVideo={handleAddVideo}
            onAddText={handleAddText}
            onBulkImport={handleBulkImport}
            onEditSpace={handleEditSpace}
          />
        )}
      </div>

      {/* Edit Space Modal */}
      <EnhancedCreateSpaceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSpace(null);
        }}
        onSubmit={handleUpdateSpace}
        loading={false}
        editingSpace={editingSpace}
      />

    </div>
  );
};

export default SpaceDetailPage;

