/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F2937",
        secondary: "#3B82F6",
        accent: "#F59E0B",
        danger: "#EF4444",
        success: "#10B981",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
    },
  },
  plugins: [],
}
