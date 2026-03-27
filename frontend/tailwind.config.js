/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a2e',
          light: '#222244',
          lighter: '#2a2a4a',
        },
        accent: {
          DEFAULT: '#e94560',
          hover: '#ff6b81',
        },
        border: {
          DEFAULT: '#333366',
        },
      },
    },
  },
  plugins: [],
}
