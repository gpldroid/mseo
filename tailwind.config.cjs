/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./articles/**/*.html",
    "./pages/**/*.html",
    "./assets/js/**/*.js"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mseo: {
          primary: "#4f46e5",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          emerald: "#10b981",
          bg: "#f8fafc",
          dark: "#0f172a",
          card: "#ffffff",
          "dark-card": "#1e293b"
        }
      },
      fontFamily: {
        arabic: ["Readex Pro", "Cairo", "sans-serif"],
        latin: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, .12)",
        soft: "0 10px 30px rgba(15, 23, 42, .07)",
        glow: "0 0 24px rgba(79, 70, 229, .28)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
