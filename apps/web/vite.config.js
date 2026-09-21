import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      "cozytadokoro.onrender.com",
      "cozyt.onrender.com",
      "localhost"
    ]
  }
});
