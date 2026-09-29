import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `vite build --mode demo` builds a self-contained preview: the real pages, but with
// src/api.js swapped for an in-browser mock (src/demo/mockApi.js) and hash-based routing.
function demoMode() {
  const mockApi = path.resolve(__dirname, 'src/demo/mockApi.js');
  return {
    name: 'citypins-demo',
    enforce: 'pre',
    resolveId(source, importer) {
      if (importer && importer !== mockApi && /(^|\/)api\.js$/.test(source)) return mockApi;
      return null;
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('/src/main.jsx', '/src/demo/main.jsx'),
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === 'demo' && demoMode()].filter(Boolean),
  base: mode === 'demo' ? './' : '/',
  build: mode === 'demo' ? { outDir: 'dist-demo', assetsInlineLimit: Infinity } : {},
  server: { port: 5173 },
}));
