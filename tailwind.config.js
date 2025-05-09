/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0F8FF",
          100: "#D9EFFF",
          200: "#B3DBFF",
          300: "#8CC7FF",
          400: "#66B2FF",
          500: "#3D9EFF",
          600: "#1A8AFF",
          700: "#0075EA",
          800: "#0061C2",
          900: "#004D99",
        },
        secondary: {
          50: "#FFF5F5",
          100: "#FFE6E6",
          200: "#FFCCCC",
          300: "#FFB3B3",
          400: "#FF9999",
          500: "#FF8080",
          600: "#FF6666",
          700: "#FF4D4D",
          800: "#FF3333",
          900: "#FF1A1A",
        },
        dark: {
          50: "#F5F7FA",
          100: "#E4E7EB",
          200: "#CBD2D9",
          300: "#9AA5B1",
          400: "#7B8794",
          500: "#616E7C",
          600: "#52606D",
          700: "#3E4C59",
          800: "#323F4B",
          900: "#1F2933",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
          },
        },
      },
    },
  },
  plugins: [],
};
