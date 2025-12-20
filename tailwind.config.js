/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        background: '#0F172A',
        surface: '#F8FAFC',
        accent: '#6B46C1',
        secondary: '#38B2AC',
        muted: '#94A3B8',
        alert: '#F6E05E',
        border: '#38B2AC',
        text: '#F8FAFC',
        primary: '#6B46C1',
      },
    },
  },
  plugins: [],
};