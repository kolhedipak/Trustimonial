import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Globe,
  Heart
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Easy Collection",
      description: "Create custom testimonial request links and share them with your customers effortlessly."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Trust & Security",
      description: "Built with trust in mind, featuring secure authentication and data protection."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Lightning Fast",
      description: "Quick setup, instant testimonials, and real-time updates for your business."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Analytics Ready",
      description: "Track testimonial performance and engagement with built-in analytics."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Embed Anywhere",
      description: "Embed testimonials on any website with our responsive widget system."
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: "Customer Love",
      description: "Turn satisfied customers into your biggest advocates with beautiful displays."
    }
  ];

  const benefits = [
    "Increase conversion rates with social proof",
    "Build trust with authentic customer stories",
    "Save time with automated collection",
    "Customize everything to match your brand",
    "Mobile-responsive design",
    "SEO-friendly testimonial pages"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-300/10 to-cta-600/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Collect & Display
              <span className="block text-primary">Trusted Testimonials</span>
            </h1>
            <p className="text-xl text-neutral-700 mb-8 max-w-3xl mx-auto">
              Transform customer feedback into powerful social proof. Create beautiful testimonial 
              collections that build trust and drive conversions for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-3">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link to="/gallery" className="btn-outline text-lg px-8 py-3">
                    View Gallery
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Collect Testimonials
            </h2>
            <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
              Our platform provides all the tools you need to collect, manage, and display 
              customer testimonials effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Why Choose Trustimonials?
              </h2>
              <p className="text-xl text-neutral-700 mb-8">
                Join thousands of businesses that trust us to help them collect and display 
                authentic customer testimonials that drive growth.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface rounded-lg p-8 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-neutral-700 mb-6">
                  Create your account and start collecting testimonials in minutes.
                </p>
                {!isAuthenticated && (
                  <Link to="/register" className="btn-primary w-full">
                    Start Free Trial
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Building Trust Today
          </h2>
          <p className="text-xl text-primary-300 mb-8">
            Join the businesses already using Trustimonials to showcase their customer success stories.
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn bg-white text-primary hover:bg-neutral-100 text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">Trustimonials</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Building trust through authentic customer testimonials.
            </p>
            <p className="text-sm text-neutral-500">
              © 2024 Trustimonials. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
