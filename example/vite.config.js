import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname),
  server: {
    port: 3005,
    open: false
  },
  build: {
    outDir: resolve(__dirname, '../dist-example'),
    emptyOutDir: true
  }
});
