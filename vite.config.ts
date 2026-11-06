import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// La guía se instala en el celular y funciona sin internet (el wifi de las expos falla).
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'nevcode-studios.svg', 'nevcode-assistant.svg'],
      manifest: {
        name: 'NevCode en la expo',
        short_name: 'NevCode Expo',
        description: 'Guía, QRs y registro de interesados para el equipo del stand de NevCode.',
        lang: 'es-MX',
        theme_color: '#131209',
        background_color: '#131209',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
