import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // La configuración 'resolve.alias' es crucial para evitar errores de ruta.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})