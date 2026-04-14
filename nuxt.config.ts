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

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'https://byg.gg',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', name: 'Français', dir: 'ltr' },
      { code: 'es', iso: 'es-ES', name: 'Español', dir: 'ltr' },
      { code: 'zh', iso: 'zh-CN', name: '中文', dir: 'ltr' },
      { code: 'ru', iso: 'ru-RU', name: 'Русский', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    vueI18n: './i18n.config.ts',
    skipSettingLocaleOnNavigate: false,
    useSetI18nLanguageCookie: true,
    alwaysRedirect: false,
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#dd289e' },
        { name: 'description', content: 'Byg Platform' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  css: [ '~/src/styles/global.sass' ],

  vite: {
    define: {
      __AppVersion: JSON.stringify('2.0.0-alpha14'),
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    css: {
      preprocessorOptions: {
        sass: {
          api: 'modern-compiler',
        },
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: false,
    },
  },

  compatibilityDate: '2024-04-14',
})
