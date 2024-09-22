const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contextes/**/*.{js,ts,jsx,tsx}",
    "./columns/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        inherit: "inherit",
        transparent: "transparent",
        gray: {
          50: "#FCFCFC",
          100: "#FAFAFA",
          200: "#F5F5F5",
          300: "#F0F0F0",
          400: "#EBEBEB",
          DEFAULT: "#E6E6E6",
          600: "#C7C7C7",
          700: "#8A8A8A",
          800: "#5B5B5B",
          900: "#2D2D2D",
          950: "#171717"
        },
        primary: {
          50: "var(--ms-primary-50)",
          100: "var(--ms-primary-100)",
          200: "var(--ms-primary-200)",
          300: "var(--ms-primary-300)",
          400: "var(--ms-primary-400)",
          DEFAULT: "var(--ms-primary)",
          600: "var(--ms-primary-600)",
          700: "var(--ms-primary-700)",
          800: "var(--ms-primary-800)",
          900: "var(--ms-primary-900)",
          950: "var(--ms-primary-950)"
        },
        secondary: {
          50: "var(--ms-secondary-50)",
          100: "var(--ms-secondary-100)",
          200: "var(--ms-secondary-200)",
          300: "var(--ms-secondary-300)",
          400: "var(--ms-secondary-400)",
          DEFAULT: "var(--ms-secondary)",
          600: "var(--ms-secondary-600)",
          700: "var(--ms-secondary-700)",
          800: "var(--ms-secondary-800)",
          900: "var(--ms-secondary-900)",
          950: "var(--ms-secondary-950)"
        },
        orange: {
          50: "var(--ms-orange-50)",
          100: "var(--ms-orange-100)",
          200: "var(--ms-orange-200)",
          300: "var(--ms-orange-300)",
          400: "var(--ms-orange-400)",
          DEFAULT: "var(--ms-orange)",
          600: "var(--ms-orange-600)",
          700: "var(--ms-orange-700)",
          800: "var(--ms-orange-800)",
          900: "var(--ms-orange-900)",
          950: "var(--ms-orange-950)"
        },
        purple: {
          50: "var(--ms-purple-50)",
          100: "var(--ms-purple-100)",
          200: "var(--ms-purple-200)",
          300: "var(--ms-purple-300)",
          400: "var(--ms-purple-400)",
          DEFAULT: "var(--ms-purple)",
          600: "var(--ms-purple-600)",
          700: "var(--ms-purple-700)",
          800: "var(--ms-purple-800)",
          900: "var(--ms-purple-900)",
          950: "var(--ms-purple-950)"
        },
        success: {
          50: "var(--ms-success-50)",
          100: "var(--ms-success-100)",
          200: "var(--ms-success-200)",
          300: "var(--ms-success-300)",
          400: "var(--ms-success-400)",
          DEFAULT: "var(--ms-success)",
          600: "var(--ms-success-600)",
          700: "var(--ms-success-700)",
          800: "var(--ms-success-800)",
          900: "var(--ms-success-900)",
          950: "var(--ms-success-950)"
        },
        danger: {
          50: "var(--ms-danger-50)",
          100: "var(--ms-danger-100)",
          200: "var(--ms-danger-200)",
          300: "var(--ms-danger-300)",
          400: "var(--ms-danger-400)",
          DEFAULT: "var(--ms-danger)",
          600: "var(--ms-danger-600)",
          700: "var(--ms-danger-700)",
          800: "var(--ms-danger-800)",
          900: "var(--ms-danger-900)",
          950: "var(--ms-danger-950)"
        },
        warning: {
          50: "var(--ms-warning-50)",
          100: "var(--ms-warning-100)",
          200: "var(--ms-warning-200)",
          300: "var(--ms-warning-300)",
          400: "var(--ms-warning-400)",
          DEFAULT: "var(--ms-warning)",
          600: "var(--ms-warning-600)",
          700: "var(--ms-warning-700)",
          800: "var(--ms-warning-800)",
          900: "var(--ms-warning-900)",
          950: "var(--ms-warning-950)"
        },
        info: {
          50: "var(--ms-info-50)",
          100: "var(--ms-info-100)",
          200: "var(--ms-info-200)",
          300: "var(--ms-info-300)",
          400: "var(--ms-info-400)",
          DEFAULT: "var(--ms-info)",
          600: "var(--ms-info-600)",
          700: "var(--ms-info-700)",
          800: "var(--ms-info-800)",
          900: "var(--ms-info-900)",
          950: "var(--ms-info-950)"
        }
      },
      animation: {
        fadeIn: "fadeIn 300ms ease",
        fadeOut: "fadeOut 300ms ease",
        slideIn: "slideIn 300ms ease"
      },
      screens: {
        xs: "320px",
        sm: "490px",
        md: "744px",
        lg: "960px",
        laptop: "1025px",
        xl: "1440px",
        "2xl": "1920px"
      },
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", ...defaultTheme.fontFamily.sans]
      }
    }
  },
  plugins: []
};
