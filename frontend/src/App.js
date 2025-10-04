import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import NewDashboard from './pages/NewDashboard';
import SpaceDetailPage from './pages/SpaceDetailPage';
import TestimonialSubmission from './pages/TestimonialSubmission';
import TestimonialsGallery from './pages/TestimonialsGallery';
import WidgetGenerator from './pages/WidgetGenerator';
import PublicSubmissionPage from './pages/PublicSubmissionPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface">
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/gallery" element={<TestimonialsGallery />} />
              <Route path="/t/:slug" element={<TestimonialSubmission />} />
              <Route path="/s/:spaceId" element={<PublicSubmissionPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <NewDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/spaces/:spaceId" 
                element={
                  <ProtectedRoute>
                    <SpaceDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard-old" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/widget-generator" 
                element={
                  <ProtectedRoute>
                    <WidgetGenerator />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#0F1724',
                border: '1px solid #D1D5DB',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#0F9D58',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E53E3E',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
