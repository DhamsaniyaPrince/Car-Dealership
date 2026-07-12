/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d5dde9',
          300: '#b2c2d7',
          400: '#8ca1c1',
          500: '#5c78a2',
          600: '#486087',
          700: '#3a4e6f',
          800: '#32425c',
          900: '#2c374d',
          950: '#1b2230',
        },
        accent: {
          50: '#fefbeb',
          100: '#fef3c7',
          200: '#fde58a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
