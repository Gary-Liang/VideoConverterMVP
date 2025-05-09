import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});