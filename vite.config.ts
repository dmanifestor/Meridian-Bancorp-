import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Determine deployment base path
const getBase = () => {
  if (process.env.BASE_PATH) {
    return process.env.BASE_PATH.endsWith('/') ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`;
  }
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH.endsWith('/') ? process.env.VITE_BASE_PATH : `${process.env.VITE_BASE_PATH}/`;
  }
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    if (parts[1]) return `/${parts[1]}/`;
  }
  return './';
};

// https://vitejs.dev/config/
export default defineConfig({
  base: getBase(),
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
