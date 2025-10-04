import React, { useState } from 'react';
import { Check } from 'lucide-react';

const ColorPicker = ({ value, onChange, label, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    '#00A676', // CTA green
    '#0B78D1', // Primary blue
    '#FFB86B', // Accent orange
    '#0F9D58', // Success green
    '#F59E0B', // Warning amber
    '#E53E3E', // Danger red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
  ];

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="form-label">{label}</label>
      <div className="flex items-center space-x-3">
        {/* Color Preview */}
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg border-2 border-neutral-300 cursor-pointer"
            style={{ backgroundColor: value }}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Select color"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input w-24 text-sm"
            placeholder="#00A676"
          />
        </div>

        {/* Color Picker Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-surface border border-neutral-300 rounded-lg shadow-lg z-50">
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-8 h-8 rounded-lg border-2 border-neutral-300 hover:border-neutral-400 transition-colors duration-200 relative"
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                >
                  {value === color && (
                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 rounded border border-neutral-300 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
