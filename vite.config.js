import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    port: 5173,
    open: true
    // Al integrar con Laravel: activar el proxy y usar VITE_API_URL para la API real.
    // proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } }
  }
});
