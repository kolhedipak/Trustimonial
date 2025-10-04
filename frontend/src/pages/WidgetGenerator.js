import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { testimonialsAPI } from '../utils/api';
import EmbedWidget from '../components/EmbedWidget';
import { Palette, Code, Settings } from 'lucide-react';

const WidgetGenerator = () => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');
  const [maxHeight, setMaxHeight] = useState('400px');
  const [maxTestimonials, setMaxTestimonials] = useState(5);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialsAPI.getTestimonials({ 
        status: 'approved',
        limit: 50 
      });
      setTestimonials(response.data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayTestimonials = testimonials.slice(0, maxTestimonials);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-surface py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Embed Widget Generator
          </h1>
          <p className="text-neutral-700">
            Generate embeddable code to display your testimonials on any website
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Widget Settings
              </h2>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="form-label">Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        theme === 'light'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <div className="w-6 h-6 bg-white border border-neutral-300 rounded mx-auto mb-2"></div>
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <div className="w-6 h-6 bg-neutral-800 border border-neutral-600 rounded mx-auto mb-2"></div>
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Max Height */}
                <div>
                  <label htmlFor="maxHeight" className="form-label">
                    Maximum Height
                  </label>
                  <select
                    id="maxHeight"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(e.target.value)}
                    className="form-input"
                  >
                    <option value="300px">300px</option>
                    <option value="400px">400px</option>
                    <option value="500px">500px</option>
                    <option value="600px">600px</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                {/* Max Testimonials */}
                <div>
                  <label htmlFor="maxTestimonials" className="form-label">
                    Maximum Testimonials
                  </label>
                  <select
                    id="maxTestimonials"
                    value={maxTestimonials}
                    onChange={(e) => setMaxTestimonials(parseInt(e.target.value))}
                    className="form-input"
                  >
                    <option value={3}>3 testimonials</option>
                    <option value={5}>5 testimonials</option>
                    <option value={10}>10 testimonials</option>
                    <option value={20}>20 testimonials</option>
                  </select>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Available Testimonials</h3>
                  <div className="text-2xl font-bold text-primary">
                    {testimonials.length}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {displayTestimonials.length} will be displayed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Preview and Code */}
          <div className="lg:col-span-2">
            <EmbedWidget 
              testimonials={displayTestimonials}
              theme={theme}
              maxHeight={maxHeight}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Customize</h3>
              <p className="text-sm text-neutral-600">
                Choose your theme, height, and number of testimonials to display
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Copy Code</h3>
              <p className="text-sm text-neutral-600">
                Copy the generated embed code to your clipboard
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-2">Embed</h3>
              <p className="text-sm text-neutral-600">
                Paste the code into your website's HTML where you want testimonials to appear
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGenerator;
