import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings } from 'lucide-react';

const Header = ({ productName = 'Trustimonials', onProfileClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page when implemented
    console.log('Navigate to settings');
    setIsProfileOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-surface border-b border-neutral-300 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 rounded-lg p-1"
            aria-label="Go to dashboard"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              {productName}
            </h1>
          </button>

          {/* User Profile */}
          {isAuthenticated ? (
          
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-neutral-700">
                {user?.name || 'User'}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-neutral-300 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-neutral-500 border-b border-neutral-200">
                    {user?.email}
                  </div>
                  <button
                    onClick={handleSettings}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-neutral-700 hover:text-primary transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
