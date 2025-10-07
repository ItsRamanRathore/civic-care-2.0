import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // Build configuration for Vercel deployment
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [react(), tagger()],
  resolve: {
    alias: {
      '@': '/src',
      'components': '/src/components',
      'pages': '/src/pages',
      'contexts': '/src/contexts',
      'utils': '/src/utils',
      'services': '/src/services',
      'styles': '/src/styles'
    }
  },
  server: {
    port: 3000,
    host: true
  }
});