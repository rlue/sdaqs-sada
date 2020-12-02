module.exports = {
  theme: {},
  variants: {
    cursor: ['responsive', 'disabled'],
    opacity: ['responsive', 'hover', 'focus', 'disabled'],
  },
  plugins: [],
  purge: [
    './app/**/*.html',
    './app/**/*.jsx',
    './assets/index.css',
  ],
};
