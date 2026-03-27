import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Clean config - no Tailwind plugin
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
