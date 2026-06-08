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
        index: resolve(__dirname, 'index.html'),
        linguMark: resolve(__dirname, 'linguMark.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html')
      }
    }
  }
});
