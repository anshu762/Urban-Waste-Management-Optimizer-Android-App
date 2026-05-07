/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a",
        secondary: "#0ea5e9",
        danger: "#ef4444",
        warning: "#f59e0b",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
};