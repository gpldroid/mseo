/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#0b1220", panel: "#111b2d", line: "#233149", accent: "#8b7cff" }, fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] } } },
  plugins: [],
};