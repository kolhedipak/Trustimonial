import React, { useState, useEffect } from 'react';
import { Copy, Code, Palette, Sun, Moon, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const EmbedWidget = ({ testimonials = [], theme = 'light', maxHeight = '400px' }) => {
  const [copied, setCopied] = useState(false);

  const generateEmbedCode = (theme, maxHeight) => {
    const baseUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';
    return `<div id="trustimonials-widget" data-theme="${theme}" data-max-height="${maxHeight}" data-source="${baseUrl}"></div>
<script src="${baseUrl}/widget.js"></script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode(theme, maxHeight));
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy embed code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Widget Preview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Widget Preview</h3>
        <div 
          className={`border rounded-lg p-4 ${theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-white'}`}
          style={{ maxHeight }}
        >
          {testimonials.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-neutral-600">No testimonials to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div key={index} className="border-b border-neutral-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.authorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{testimonial.authorName}</h4>
                        {testimonial.rating && (
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= testimonial.rating ? 'text-accent' : 'text-neutral-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {testimonial.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embed Code */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Embed Code</h3>
          <button
            onClick={copyToClipboard}
            className="btn-outline flex items-center space-x-2"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
        
        <div className="bg-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{generateEmbedCode(theme, maxHeight)}</pre>
        </div>
        
        <p className="text-sm text-neutral-600 mt-2">
          Copy this code and paste it into your website's HTML where you want the testimonials to appear.
        </p>
      </div>
    </div>
  );
};

export default EmbedWidget;
