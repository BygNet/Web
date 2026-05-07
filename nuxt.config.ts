import { fileURLToPath } from 'node:url'

import pkg from './package.json'

export default defineNuxtConfig({
  ssr: true,
  future: { compatibilityVersion: 4 },

  modules: [ '@nuxtjs/i18n', '@vite-pwa/nuxt' ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.byg.a35.dev',
      adsBase: process.env.NUXT_PUBLIC_ADS_BASE || 'https://ads.byg.a35.dev',
      posthogPublicKey: 'phc_M5dK6A49VD1zj7L5iamsBbIO4RhikB8FbxUyVfTlEZy',
      posthogHost: 'https://s.a35.dev',
      posthogDefaults: '2026-01-30',
    },
  },

  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://byg.gg',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
      redirectOn: 'no prefix',
      fallbackLocale: 'en',
    },
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        dir: 'ltr',
        files: [
          'en/auth.json',
          'en/common.json',
          'en/messages.json',
          'en/nav.json',
          'en/pages.json',
          'en/ui.json',
        ],
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        dir: 'ltr',
        files: [
          'fr/auth.json',
          'fr/common.json',
          'fr/messages.json',
          'fr/nav.json',
          'fr/pages.json',
          'fr/ui.json',
        ],
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        dir: 'ltr',
        files: [
          'es/auth.json',
          'es/common.json',
          'es/messages.json',
          'es/nav.json',
          'es/pages.json',
          'es/ui.json',
        ],
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        name: '中文',
        dir: 'ltr',
        files: [
          'zh/auth.json',
          'zh/common.json',
          'zh/messages.json',
          'zh/nav.json',
          'zh/pages.json',
          'zh/ui.json',
        ],
      },
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Русский',
        dir: 'ltr',
        files: [
          'ru/auth.json',
          'ru/common.json',
          'ru/messages.json',
          'ru/nav.json',
          'ru/pages.json',
          'ru/ui.json',
        ],
      },
    ],
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#dd289e' },
        {
          name: 'description',
          content: 'Share posts, send messages, and search the web with Byg.',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { property: 'og:image', content: '/logos/Byg2-6Preview.jpg' },
        { property: 'og:url', content: 'https://byg.a35.dev/' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', href: '/logos/BygLogo.png' },
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
        { rel: 'dns-prefetch', href: 'https://emojis.byg.a35.dev' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:ital,wght@0,400..800;1,400..800&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/ab-tests@1.1.2/assets/fonts/satoshi/satoshi.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://emojis.byg.a35.dev/FluentEmojiColor.css',
        },
      ],
      script: [ { src: 'https://tally.so/widgets/embed.js' } ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    includeAssets: [ 'favicon.ico', 'logos/BygLogo-Pwa.png', 'tos.md' ],
    manifest: false,
    strategies: 'injectManifest',
    srcDir: '.',
    filename: 'sw.ts',
    injectManifest: {
      globPatterns: [
        '**/*.{js,css,html,ico,png,svg,webmanifest,woff2,woff,ttf,jpg,jpeg,json}',
      ],
      maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, // 7 MB
    },
    workbox: {
      maximumFileSizeToCacheInBytes: 7 * 1024 * 1024, // 7 MB
      globPatterns: [
        '**/*.{js,css,html,ico,png,svg,webmanifest,woff2,woff,ttf,jpg,jpeg,json}',
      ],
    },
  },

  css: [ '@/styles/global.sass' ],

  vite: {
    define: {
      __AppVersion: JSON.stringify(pkg.version),
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'vue-progressive-blur',
        '@iconify/vue',
        'dompurify',
        'marked',
        'mitt',
      ],
    },
  },

  nitro: {
    prerender: {
      crawlLinks: false,
    },
  },

  compatibilityDate: '2026-05-15',
})
