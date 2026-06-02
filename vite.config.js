import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Node.js path resolutions for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
  base: './', // Ensures relative paths for asset builds (perfect for GitHub Pages or Vercel)
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Multi-page entrypoints
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html')
      }
    }
  }
});
