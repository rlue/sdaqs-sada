module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')('./config/tailwindcss.js'),
    require('autoprefixer'),
  ],
};
