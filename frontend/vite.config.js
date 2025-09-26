import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          green: "#43c6ac",
          navy: "#191654",
          blue1: "#00b4db",
          blue2: "#0083b0",
        },
      },
      backgroundImage: {
        "nav-gradient": "linear-gradient(180deg, #43c6ac, #191654)",
        "btn-gradient": "linear-gradient(180deg, #00b4db, #0083b0)",
      },
    },
  },
  plugins: [react(), tailwindcss(),],
  
})
