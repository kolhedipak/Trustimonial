import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../utils/api';
import Header from '../components/Header';
import OverviewCard from '../components/OverviewCard';
import SpacesPanel from '../components/SpacesPanel';
import EnhancedCreateSpaceModal from '../components/EnhancedCreateSpaceModal';
import { Video, Users, Star, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const NewDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingSpace, setCreatingSpace] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewResponse, spacesResponse] = await Promise.all([
        dashboardAPI.getOverview(),
        dashboardAPI.getSpaces()
      ]);
      
      setOverview(overviewResponse.data.overview);
      setSpaces(spacesResponse.data.spaces);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setSpacesLoading(false);
    }
  };

  const handleCreateSpace = async (spaceData) => {
    try {
      setCreatingSpace(true);
      const response = await dashboardAPI.createSpace(spaceData);
      
      // Optimistic update
      setSpaces(prev => [response.data.space, ...prev]);
      setShowCreateModal(false);
      setEditingSpace(null);
      toast.success('Space created successfully!');
    } catch (error) {
      console.error('Error creating space:', error);
      toast.error('Failed to create space');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setCreatingSpace(false);
    }
  };

  const handleUpdateSpace = async (spaceData) => {
    try {
      setCreatingSpace(true);
      const response = await dashboardAPI.updateSpace(editingSpace.id, spaceData);
      setSpaces(prev => prev.map(space => 
        space.id === editingSpace.id ? response.data.space : space
      ));
      setShowCreateModal(false);
      setEditingSpace(null);
      //toast.success('Space updated successfully!');
    } catch (error) {
      console.error('Error updating space:', error);
      toast.error('Failed to update space');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setCreatingSpace(false);
    }
  };

  const handleEditSpace = (space) => {
    // TODO: Implement edit functionality
    console.log('Edit space:', space);
    toast('Edit functionality coming soon');
  };

  const handleDeleteSpace = async (space) => {
    if (!window.confirm(`Are you sure you want to delete "${space.name}"?`)) {
      return;
    }

    try {
      await dashboardAPI.deleteSpace(space.id);
      setSpaces(prev => prev.filter(s => s.id !== space.id));
      toast.success('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      toast.error('Failed to delete space');
    }
  };

  const handleViewSpace = (space) => {
    // Open the modal in edit mode
    setEditingSpace(space);
    setShowCreateModal(true);
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade functionality
    console.log('Upgrade clicked');
    toast('Upgrade functionality coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted-surface">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card p-6">
                  <div className="h-20 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="card p-6">
              <div className="h-64 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Dashboard
          </h1>
          <p className="text-neutral-700">
            Manage your testimonial spaces and track your progress
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Videos"
            value={overview?.totalVideos || 0}
            subvalue={overview?.videoLimit || 2}
            progressPercent={overview?.videoUsagePercent || 0}
            ctaLabel="Upgrade Plan"
            ctaVariant="secondary"
            onCtaClick={handleUpgrade}
            icon={<Video className="w-6 h-6 text-primary" />}
            variant="metric"
          />
          
          <OverviewCard
            title="Spaces"
            value={overview?.totalSpaces || 0}
            ctaLabel="Create Space"
            onCtaClick={() => setShowCreateModal(true)}
            icon={<Users className="w-6 h-6 text-primary" />}
            variant="metric"
          />
          
          <OverviewCard
            title="Testimonials"
            value={overview?.totalTestimonials || 0}
            icon={<Star className="w-6 h-6 text-primary" />}
            variant="metric"
          />
          
          <OverviewCard
            title="Current Plan"
            value={overview?.planName || 'Starter'}
            subvalue={overview?.planFeatures || []}
            ctaLabel="Upgrade"
            ctaVariant="secondary"
            onCtaClick={handleUpgrade}
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
            variant="plan"
          />
        </div>

        {/* Spaces Panel */}
        <SpacesPanel
          spaces={spaces}
          onCreateSpace={() => setShowCreateModal(true)}
          onEditSpace={handleEditSpace}
          onDeleteSpace={handleDeleteSpace}
          onViewSpace={handleViewSpace}
          loading={spacesLoading}
        />
      </main>

      {/* Create/Edit Space Modal */}
      <EnhancedCreateSpaceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingSpace(null);
        }}
        onSubmit={editingSpace ? handleUpdateSpace : handleCreateSpace}
        loading={creatingSpace}
        editingSpace={editingSpace}
      />
    </div>
  );
};

export default NewDashboard;
