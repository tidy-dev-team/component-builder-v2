import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
  },
  resolve: {
    alias: {
      // Handle Preact imports
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  esbuild: {
    target: 'es2020',
  },
});