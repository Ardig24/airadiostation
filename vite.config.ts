import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Conditionally import lovable-tagger only in development
let componentTagger;
try {
  const lovableTagger = require('lovable-tagger');
  componentTagger = lovableTagger.componentTagger;
} catch (error) {
  // Mock the componentTagger function if the package is not available
  componentTagger = () => null;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
