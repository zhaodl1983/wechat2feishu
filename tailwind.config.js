/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        "apple-gray": "#F5F5F7",
        "apple-card": "#2C2C2E",       // New from design
        "apple-dark-bg": "#121212",    // New from design
        "vibrant-green": "#28CD41",
        "vibrant-amber": "#FFB800",
        "vibrant-red": "#FF3B30",
      },
      spacing: {
        'golden-sm': '1.618rem',
        'golden-md': '2.618rem',
        'golden-lg': '4.236rem',
        'golden-xl': '6.854rem',
      },
      borderRadius: {
        'apple': '12px',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};