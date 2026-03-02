/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'haven-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Override teal with sage green palette
        teal: {
          50: '#F0F5F1',
          100: '#E8F0EA',
          200: '#C5D9CA',
          300: '#A2C2AB',
          400: '#8FB39A',
          500: '#7B9E87',
          600: '#6B8E76',
          700: '#5A7E65',
          800: '#4A6A53',
          900: '#3A5241',
        },
        // Override amber with warm gold palette
        amber: {
          50: '#FBF7EE',
          100: '#F5EFE3',
          200: '#EBD9B8',
          300: '#DEC48D',
          400: '#D4B47C',
          500: '#C8A96E',
          600: '#B8955A',
          700: '#A07A3F',
          800: '#7A5E30',
          900: '#5A4522',
        },
        // Override orange with warm bronze
        orange: {
          400: '#D4A86A',
          500: '#C09050',
          600: '#A87A3A',
        },
        // Warm cream background
        cream: '#FBF8F3',
      },
      fontFamily: {
        heading: ['Montserrat', 'var(--font-heading)', 'Georgia', 'serif'],
        body: ['Source Sans 3', 'var(--font-body)', 'system-ui', 'sans-serif'],
        ui: ['Source Sans 3', 'var(--font-ui)', 'system-ui', 'sans-serif'],
        sans: ['Source Sans 3', 'var(--font-body)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        sm: ['0.9rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.6' }],
      },
    },
  },
  plugins: [],
};
