/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'darkish':"#104373",
        'white':"#FFFFFF",
        'black':"#000000",
        'primary':"#D3D3D3",
        'secondary':"#F5F5DC",
        'tertiary':"#62CBE7",
        'common-hover':"#21205F"
      }
    },
  },
  plugins: [],
}