import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Build configuration for Vercel deployment
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    react(), 
    tagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'civic-care-logo.jpg'],
      manifest: {
        name: 'Civic Care',
        short_name: 'CivicCare',
        description: 'Empowering communities through better civic engagement',
        theme_color: '#2563eb',
        icons: [
          {
            src: 'civic-care-logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'civic-care-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
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
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});