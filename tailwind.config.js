/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./*.{js,ts,jsx,tsx}",              // 👈 IMPORTANT: Looks at App.tsx in root
      "./components/**/*.{js,ts,jsx,tsx}", // 👈 Looks at your components folder
      "./utils/**/*.{js,ts,jsx,tsx}",      // 👈 Looks at utils folder
    ],
    theme: {
      extend: {
        colors: {
          gold: '#ffd700', // Restores your custom gold color
        },
      },
    },
    plugins: [],
  }