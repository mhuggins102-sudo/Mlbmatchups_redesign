/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#111827',
          raised: '#1e293b',
          dark: '#0a0e17',
        },
        primary: {
          DEFAULT: '#3b82f6',
          glow: '#2563eb',
        },
        accent: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f97316',
        medal: {
          bronze: '#cd7f32',
          silver: '#708090',
          gold: '#ffd700',
          platinum: '#80e0e0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
