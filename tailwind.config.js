/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary-color)',
        'secondary': 'var(--secondary-color)',
        'tertiary': 'var(--tertiary-color)',
        'common': 'var(--common-color)',
        'common-hover': 'var(--common-hover-color)',
        'input': 'var(--input-color)'
      }
    },
  },
  plugins: [
    require('flowbite/plugin')({
        charts: true,
    }),
    // ... other plugins
  ]
}