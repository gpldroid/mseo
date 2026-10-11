import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const monorepoBuild = process.env.MSEO_MONOREPO_BUILD === "true";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    sourcemap: false,
    outDir: monorepoBuild ? "../.netlify-admin-build" : "dist",
    emptyOutDir: true,
  },
});
