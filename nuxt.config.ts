import { fileURLToPath } from 'node:url'
import pkg from './package.json'

export default defineNuxtConfig({
  ssr: true,
  future: { compatibilityVersion: 4 },

  modules: [ '@nuxtjs/i18n' ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.byg.a35.dev',
      adsBase: process.env.NUXT_PUBLIC_ADS_BASE || 'https://ads.byg.a35.dev',
    },
  },

  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
  },

  i18n: {
    strategy: 'prefix_except_default',
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://byg.gg',
    defaultLocale: 'en',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: false,
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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#dd289e' },
        { name: 'description', content: 'Byg Platform' },
      ],
      link: [ { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' } ],
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

  compatibilityDate: '2024-04-14',
})
