// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ↓ここにリポジトリ名を指定
export default defineConfig({
  plugins: [react()],
  base: '/tk_a_2520/', 
})
