/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can customize your theme here
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Optional: If you want a specific font
      },
    },
  },
  plugins: [],
}