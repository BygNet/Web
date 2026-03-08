import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

import pkgMeta from './package.json'

export default defineConfig({
  define: {
    __AppVersion: JSON.stringify(pkgMeta.version),
  },
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      registerType: 'autoUpdate',
      includeAssets: [ 'favicon.ico' ],
      manifest: {
        name: 'Byg Platform',
        short_name: 'Byg',
        description: 'Byg Platform for Web',
        theme_color: '#dd289e',
        background_color: '#8e5586',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logos/BygLogo-Pwa.png',
            sizes: '1024x1024',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
