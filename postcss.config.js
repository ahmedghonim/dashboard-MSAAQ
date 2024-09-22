module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-rtlcss": {
      ltrPrefix: '[dir="rtl"]',
      rtlPrefix: '[dir="ltr"]'
    }
  }
};
