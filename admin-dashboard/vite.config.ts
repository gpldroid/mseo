import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const monorepoBuild = process.env.MSEO_MONOREPO_BUILD === "true";

// GitHub Pages serves this repository beneath /mseo/admin-dashboard/.
// Set VITE_BASE_PATH explicitly for alternate hosts (e.g. "/" on a Netlify root deploy).
const defaultBasePath = monorepoBuild ? "/admin-dashboard/" : "/mseo/admin-dashboard/";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || defaultBasePath,
  build: {
    sourcemap: false,
    outDir: monorepoBuild ? "../.netlify-admin-build" : "dist",
    emptyOutDir: true,
  },
});
