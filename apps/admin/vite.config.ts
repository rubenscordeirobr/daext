import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'node:path'

// Separate Vite config for the admin dashboard
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, '../../packages/ui/src')
    }
  },
  server: {
    port: 3001,
    host: '0.0.0.0'
  }
})
