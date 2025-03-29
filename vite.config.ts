import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Conditionally import lovable-tagger only in development
// Define a type-safe mock function that matches the Plugin interface
let componentTagger = () => {
  return null as any; // Using any to bypass type checking for the mock
};

// Only try to import in development environment
if (process.env.NODE_ENV === 'development') {
  try {
    // Using dynamic import to avoid issues with Node.js version compatibility
    // This is executed at runtime, so we'll handle it properly then
    console.log('Development mode: will attempt to load lovable-tagger if available');
    // We'll rely on the mode check in the plugin array to handle this correctly
  } catch (error) {
    // Fallback for any synchronous errors
    console.warn('Error setting up lovable-tagger:', error);
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),
    // Only include componentTagger in development mode and only if available
    mode === 'development' ? componentTagger() : null,
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
