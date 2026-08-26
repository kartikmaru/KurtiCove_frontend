/** @type {import('tailwindcss').Config} */
// NOTE: Tailwind v4 is CSS-first. Theme configuration lives in globals.css
// via @theme blocks. This file is kept for tooling compatibility only.
const config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
