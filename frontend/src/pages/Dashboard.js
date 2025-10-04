import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { linksAPI, testimonialsAPI } from '../utils/api';
import { 
  Plus, 
  Link as LinkIcon, 
  Star, 
  Eye, 
  Copy, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('links');
  const [links, setLinks] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateLink, setShowCreateLink] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linksResponse, testimonialsResponse] = await Promise.all([
        linksAPI.getLinks(),
        testimonialsAPI.getTestimonials({ limit: 10 })
      ]);
      
      setLinks(linksResponse.data.links);
      setTestimonials(testimonialsResponse.data.testimonials);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-danger" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'rejected':
        return 'text-danger';
      default:
        return 'text-neutral-400';
    }
  };

  const stats = {
    totalLinks: links.length,
    totalTestimonials: testimonials.length,
    approvedTestimonials: testimonials.filter(t => t.status === 'approved').length,
    pendingTestimonials: testimonials.filter(t => t.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-neutral-700">
            Manage your testimonial links and view submitted testimonials
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-300/20 rounded-lg">
                <LinkIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total Links</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalLinks}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success/20 rounded-lg">
                <Star className="w-6 h-6 text-success" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Approved</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.approvedTestimonials}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pending</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.pendingTestimonials}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.totalTestimonials}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-neutral-300">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('links')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'links'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Testimonial Links
              </button>
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'testimonials'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                Testimonials
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'links' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Your Testimonial Links</h2>
              <button
                onClick={() => setShowCreateLink(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Link</span>
              </button>
            </div>

            {links.length === 0 ? (
              <div className="card p-12 text-center">
                <LinkIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No links created yet
                </h3>
                <p className="text-neutral-700 mb-6">
                  Create your first testimonial link to start collecting feedback
                </p>
                <button
                  onClick={() => setShowCreateLink(true)}
                  className="btn-primary"
                >
                  Create Your First Link
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {links.map((link) => (
                  <div key={link.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {link.slug}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          Created {new Date(link.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          link.isValid ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                        }`}>
                          {link.isValid ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-neutral-600 mb-2">Link URL:</p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={link.url}
                          readOnly
                          className="form-input flex-1 text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(link.url)}
                          className="btn-outline p-2"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-neutral-600">Uses</p>
                        <p className="font-semibold text-neutral-900">
                          {link.uses} {link.maxUses ? `/ ${link.maxUses}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-neutral-600">Expires</p>
                        <p className="font-semibold text-neutral-900">
                          {link.expiryDate 
                            ? new Date(link.expiryDate).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="btn-outline flex-1 flex items-center justify-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button className="btn-outline text-danger hover:bg-danger/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Recent Testimonials</h2>
              <button className="btn-outline">
                View All
              </button>
            </div>

            {testimonials.length === 0 ? (
              <div className="card p-12 text-center">
                <Star className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No testimonials yet
                </h3>
                <p className="text-neutral-700">
                  Testimonials will appear here once customers submit them
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial._id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {testimonial.authorName}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {new Date(testimonial.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(testimonial.status)}
                        <span className={`text-sm font-medium ${getStatusColor(testimonial.status)}`}>
                          {testimonial.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-700 mb-4 line-clamp-3">
                      {testimonial.content}
                    </p>

                    {testimonial.rating && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-neutral-600">Rating:</span>
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`w-4 h-4 ${
                                value <= testimonial.rating ? 'text-accent fill-current' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <button className="btn-outline text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {testimonial.status === 'pending' && user?.role === 'Admin' && (
                        <button className="btn-primary text-sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
