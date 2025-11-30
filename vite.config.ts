import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@state': path.resolve(__dirname, 'src/state'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@i18n': path.resolve(__dirname, 'src/i18n'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
});
