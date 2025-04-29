import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default {
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
}