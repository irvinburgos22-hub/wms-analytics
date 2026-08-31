import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wms-analytics/'  // <-- IMPORTANTE: Este debe ser el nombre exacto de tu repositorio en GitHub
})