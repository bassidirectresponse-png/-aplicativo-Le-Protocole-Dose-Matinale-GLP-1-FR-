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
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(131, 24, 67, 0.06), 0 8px 32px rgba(131, 24, 67, 0.08)',
        'soft-lg': '0 4px 16px rgba(131, 24, 67, 0.10), 0 16px 48px rgba(131, 24, 67, 0.14)',
      }
    },
  },
  plugins: [],
}
