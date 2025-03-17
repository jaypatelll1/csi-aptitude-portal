/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '900px', 
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Use Poppins as the default font
      },
    },
  },
  plugins: [],
}
