/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B78D1',
          600: '#0962A8',
          300: '#5FA8F0',
        },
        cta: {
          DEFAULT: '#00A676',
          600: '#007A53',
        },
        accent: '#FFB86B',
        success: '#0F9D58',
        warning: '#F59E0B',
        danger: '#E53E3E',
        neutral: {
          900: '#0F1724',
          700: '#374151',
          500: '#6B7280',
          300: '#D1D5DB',
          100: '#F3F4F6',
        },
        surface: '#FFFFFF',
        'muted-surface': '#FAFAFB',
      },
      borderRadius: {
        'lg': '10px',
      },
      boxShadow: {
        'focus': '0 0 0 3px rgba(11,120,209,0.18)',
      },
      spacing: {
        '18': '4.5rem',
      },
      minHeight: {
        '44': '44px',
      },
      minWidth: {
        '44': '44px',
      }
    },
  },
  plugins: [],
}
