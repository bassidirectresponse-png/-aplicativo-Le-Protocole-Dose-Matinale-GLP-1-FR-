/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink': {
          50: '#fff8f5',
          100: '#ffe8df',
          200: '#ffd2c4',
          300: '#ffae9c',
          400: '#fb8479',
          500: '#f05d6a',
          600: '#dc3f55',
          700: '#b92c45',
          800: '#97263d',
          900: '#7e2437',
        },
        'rosegold': {
          DEFAULT: '#b76e79',
          light: '#e0b0b8',
          dark: '#93515c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
