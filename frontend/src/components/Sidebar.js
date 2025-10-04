import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Video, MessageSquare, Link, Archive, Flag, Share2, ExternalLink, Star, Zap, BarChart3, Settings, Mail, Code, FileText } from 'lucide-react';

const Sidebar = ({ activeFilter, onFilterChange, isCollapsed, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState({
    inbox: true,
    integrations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const inboxFilters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'text', label: 'Text', icon: MessageSquare },
    { id: 'linked', label: 'Linked', icon: Link },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'spam', label: 'Spam', icon: Flag }
  ];

  const integrations = [
    { id: 'social-media', label: 'Social media', icon: Share2 },
    { id: 'external-videos', label: 'External videos', icon: ExternalLink },
    { id: 'other-reviews', label: 'Other reviews', icon: Star },
    { id: 'custom-cards', label: 'Custom cards', icon: FileText },
    { id: 'email-assistant', label: 'Testimonial Email Assistant', icon: Mail },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'embed-widgets', label: 'Embed widgets', icon: Code },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'space-settings', label: 'Space settings', icon: Settings }
  ];

  const sidebarClasses = `
    bg-surface border-r border-neutral-300 h-full transition-all duration-300
    ${isCollapsed ? 'w-16' : 'w-64'}
  `;

  return (
    <aside className={sidebarClasses} role="navigation" aria-label="Space navigation">
      <div className="p-4">
        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-600" />
          )}
        </button>

        {!isCollapsed && (
          <>
            {/* Inbox Section */}
            <div className="mt-6">
              <button
                onClick={() => toggleSection('inbox')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
                aria-expanded={expandedSections.inbox}
              >
                <span className="text-sm font-semibold text-neutral-900">Inbox</span>
                {expandedSections.inbox ? (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {expandedSections.inbox && (
                <nav className="mt-2" role="list">
                  {inboxFilters.map((filter) => {
                    const Icon = filter.icon;
                    const isActive = activeFilter === filter.id;
                    
                    return (
                      <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring
                          ${isActive 
                            ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                            : 'text-neutral-700 hover:bg-neutral-100'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                        role="listitem"
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Integrations Section */}
            <div className="mt-6">
              <button
                onClick={() => toggleSection('integrations')}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
                aria-expanded={expandedSections.integrations}
              >
                <span className="text-sm font-semibold text-neutral-900">Integrations</span>
                {expandedSections.integrations ? (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {expandedSections.integrations && (
                <nav className="mt-2" role="list">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    
                    return (
                      <button
                        key={integration.id}
                        onClick={() => onFilterChange(integration.id)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        role="listitem"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{integration.label}</span>
                      </button>
                    );
                  })}
                </nav>
              )}
            </div>
          </>
        )}

        {/* Collapsed Icons */}
        {isCollapsed && (
          <div className="mt-6 space-y-2">
            {inboxFilters.slice(0, 4).map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;
              
              return (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`
                    w-full flex items-center justify-center p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-focus-ring
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-neutral-700 hover:bg-neutral-100'
                    }
                  `}
                  aria-label={filter.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">A</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

