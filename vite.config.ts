import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Byg Platform',
        short_name: 'Byg',
        description: 'Byg Platform for Web',
        theme_color: '#69ffff',
        background_color: '#557d8e',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logos/BygLogo-NoRound.png',
            sizes: '1024x1024',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
