/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        accent: '#FF6584',
        neutral: '#0f172a'
      },
      boxShadow: {
        soft: '0 10px 50px -20px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
};
