const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        surface: '#161B22',
        primary: '#58A6FF',
        secondary: '#8B5CF6',
        border: '#30363D',
        'foreground-default': '#C9D1D9',
        'foreground-muted': '#8B949E',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
