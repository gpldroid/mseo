import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fastseo.site',
  output: 'static',
  publicDir: './public',
  outDir: './dist',
  build: { format: 'file' },
  trailingSlash: 'never'
});
