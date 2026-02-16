/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0F1117',
        'cyan-accent': '#00F5FF',
        'purple-accent': '#9D4EDD',
        'pink-accent': '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'monospace'],
      },
    },
  },
  plugins: [],
}
