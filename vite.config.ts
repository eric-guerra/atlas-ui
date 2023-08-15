import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Library build: peers stay external so apps share one React/MUI/emotion instance.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'atlas-ui' },
    rollupOptions: { external: [/^react/, /^@mui\//, /^@emotion\//] },
  },
});
