import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'

const pkgMeta = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as {
  version: string
}

export default defineNuxtConfig({
  compatibilityDate: '2026-04-02',
  srcDir: 'src/',
  css: [ '@/styles/global.sass' ],
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? '',
      adsBase: process.env.NUXT_PUBLIC_ADS_BASE ?? '',
      appVersion: pkgMeta.version,
    },
  },
  app: {
    head: {
      title: 'Byg Platform',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ],
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico',
        },
      ],
    },
  },
})
