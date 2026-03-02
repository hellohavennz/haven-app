/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand — refined sage/teal
        teal: {
          50:  '#F4F7F5',
          100: '#E6EFEA',
          200: '#C7DAD1',
          300: '#A7C5B8',
          400: '#7FAF9D',
          500: '#5F9D86',
          600: '#4E8571',
          700: '#3F6D5D',
          800: '#31574A',
          900: '#244238',
        },
        // Accent — refined gold
        amber: {
          50:  '#FDF9F0',
          100: '#F8F1E1',
          200: '#EED7A8',
          300: '#E3BE75',
          400: '#D7A653',
          500: '#C9973F',
          600: '#B5832E',
          700: '#946A22',
          800: '#72511A',
          900: '#533A13',
        },
        // Neutral system — warm grey with green undertone
        slate: {
          50:  '#F8FAF9',
          100: '#F1F4F3',
          200: '#DDE5E2',
          300: '#BFCBC6',
          400: '#94A3A0',
          500: '#6B7C78',
          600: '#4F5F5B',
          700: '#394744',
          800: '#26312F',
          900: '#17201E',
          950: '#0F1614',
        },
        // Practice section — muted periwinkle blue
        blue: {
          50:  '#F0F4FD',
          100: '#DDE7F9',
          200: '#BACEF3',
          300: '#8FAAEB',
          400: '#6589DA',
          500: '#4A6FC9',
          600: '#3C5DB5',
          700: '#2F4C96',
          800: '#243B78',
          900: '#1A2C5B',
          950: '#0F1B3A',
        },
        // Orange — warm bronze (unchanged)
        orange: {
          400: '#D4A86A',
          500: '#C09050',
          600: '#A87A3A',
        },
        // Backgrounds
        cream:    '#FAF7F2',
        'app-bg': '#F4F7F5',
        // Authority / depth (nav, footer, high-contrast)
        ink: {
          900: '#1C2A38',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'var(--font-heading)', 'Georgia', 'serif'],
        body:    ['Source Sans 3', 'var(--font-body)', 'system-ui', 'sans-serif'],
        ui:      ['Source Sans 3', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        sans:    ['Source Sans 3', 'var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        sm:   ['0.9rem', { lineHeight: '1.5' }],
        base: ['1rem',   { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
};
