import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['haven-icons/favicon.ico', 'haven-icons/icon-192x192.png', 'haven-icons/icon-512x512.png'],
      manifest: {
        name: 'Haven Study',
        short_name: 'Haven',
        description: 'Pass the Life in the UK test with calm, guided study.',
        theme_color: '#0d9488',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/uk/',
        scope: '/uk/',
        icons: [
          { src: 'haven-icons/icon-64x64.png',   sizes: '64x64',   type: 'image/png' },
          { src: 'haven-icons/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
          { src: 'haven-icons/icon-512x512.png',  sizes: '512x512', type: 'image/png' },
          { src: 'haven-icons/icon-512x512.png',  sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/uk/',
        navigateFallbackDenylist: [/^\/\.netlify/],
        // ── Phase 2: cache Supabase content API responses for offline study ──
        // StaleWhileRevalidate: serve from cache immediately, update in background.
        // After the first online visit all lesson content is available offline.
        runtimeCaching: [
          {
            urlPattern: /https:\/\/auth\.havenstudy\.app\/rest\/v1\/(modules|lessons|study_sections|questions|flashcards)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'haven-content-v1',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'recharts': ['recharts'],
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
