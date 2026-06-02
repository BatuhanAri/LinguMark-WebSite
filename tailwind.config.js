/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./privacy.html",
    "./terms.html",
    "./src/**/*.{js,ts,html}"
  ],
  theme: {
    extend: {
      colors: {
        // LinguMark official brand colors
        'primary-teal': '#0D9488',
        'primary-dark': '#134E4A',
        'bg-light': '#FAFAFA',
        'surface-white': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#475569',
        'text-muted': '#64748B',
        'premium-gold': '#D4A017',
        'premium-gold-light': '#FFF8E1',
        'oxford-blue': '#2563EB',
      },
      fontFamily: {
        // outfit for display/headers, inter for copy
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '12px',
      }
    },
  },
  plugins: [],
}
