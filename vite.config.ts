import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

function resolveManualChunk(id: string) {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (
    id.includes('/node_modules/react/') ||
    id.includes('/react-dom/') ||
    id.includes('/react-is/')
  ) {
    return 'react-vendor';
  }

  if (
    id.includes('/scheduler/') ||
    id.includes('/use-sync-external-store/') ||
    id.includes('/react/jsx-runtime') ||
    id.includes('/react/jsx-dev-runtime') ||
    id.includes('/loose-envify/')
  ) {
    return 'react-vendor';
  }

  if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
    return 'router-vendor';
  }

  if (id.includes('/@tanstack/react-query/')) {
    return 'query-vendor';
  }

  if (id.includes('/antd/') || id.includes('/@ant-design/icons/')) {
    return 'antd-vendor';
  }

  if (
    id.includes('/react-hook-form/') ||
    id.includes('/@hookform/resolvers/') ||
    id.includes('/zod/')
  ) {
    return 'form-vendor';
  }

  return 'vendor';
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5112',
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          return resolveManualChunk(id);
        },
      },
    },
  },
});
