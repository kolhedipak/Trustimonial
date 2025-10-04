import React, { useState, useEffect } from 'react';
import { testimonialsAPI } from '../utils/api';
import { Star, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const TestimonialsGallery = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTestimonials();
  }, [filters]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'approved',
        ...filters
      };
      
      const response = await testimonialsAPI.getTestimonials(params);
      setTestimonials(response.data.testimonials);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  const handleRatingFilter = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? '' : rating,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`w-4 h-4 ${
              value <= rating ? 'text-accent fill-current' : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Customer Testimonials
          </h1>
          <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
            See what our customers are saying about their experiences
          </p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search testimonials..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="form-input pl-10"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Rating:</span>
              <div className="flex space-x-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      filters.rating === rating.toString()
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No testimonials found
            </h3>
            <p className="text-neutral-700">
              {filters.search || filters.rating
                ? 'Try adjusting your search criteria'
                : 'Check back later for new testimonials'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial._id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {testimonial.authorName}
                      </h3>
                      {testimonial.rating && (
                        <div className="mt-1">
                          {renderStars(testimonial.rating)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {new Date(testimonial.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-neutral-700 leading-relaxed">
                    {testimonial.content}
                  </p>

                  {testimonial.images && testimonial.images.length > 0 && (
                    <div className="mt-4">
                      <div className="flex space-x-2">
                        {testimonial.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Testimonial image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ))}
                        {testimonial.images.length > 3 && (
                          <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-sm text-neutral-500">
                            +{testimonial.images.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          pagination.page === page
                            ? 'bg-primary text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn-outline flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestimonialsGallery;
