/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        accent: "var(--color-accent)",
        secondary: "var(--color-secondary)",
        muted: "var(--color-muted)",
        alert: "var(--color-alert)",
      },
    },
  },
  plugins: [],
};
