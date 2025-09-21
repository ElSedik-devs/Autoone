/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        primary: "#0052CC",   // brand blue
        secondary: "#FFCC00", // brand yellow
      },
    },
  },
  plugins: [],
};
