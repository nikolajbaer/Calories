import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Precache the built app so it loads instantly and works offline; a new
      // deploy is picked up in the background and applied on the next launch.
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Calorie Tracker',
        short_name: 'Calories',
        description: 'A local-first daily calorie and exercise tracker.',
        display: 'standalone',
        orientation: 'portrait',
        // Matches --page-plane so the splash screen and status bar blend into the app.
        theme_color: '#f4f3ee',
        background_color: '#f4f3ee',
        categories: ['health', 'fitness'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
