import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://stay-nest-1.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://stay-nest-1.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
