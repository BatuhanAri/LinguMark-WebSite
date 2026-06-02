// PostCSS Configuration File
// This configuration file is used by Tailwind CSS and Vite to process our CSS files.
// We are using ES modules (export default) since our project is set up with "type": "module".

export default {
  plugins: {
    // tailwindcss: Processes our Tailwind utility classes and compiles them into final CSS
    tailwindcss: {},
    // autoprefixer: Automatically adds vendor prefixes (-webkit-, -moz-, etc.) to ensure 
    // cross-browser compatibility for CSS properties like grid, transitions, flexbox, etc.
    autoprefixer: {},
  },
}
