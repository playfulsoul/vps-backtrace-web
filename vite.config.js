import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/vps-backtrace-web/', // 适配 GitHub Pages 的子目录路径
  plugins: [
    react(),
    tailwindcss(),
  ],
})
