/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      // Path to all component and page files directly inside the app folder
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [
      // This plugin adds the utilities for custom scrollbars
      require('tailwind-scrollbar'),
    ],
  }
  