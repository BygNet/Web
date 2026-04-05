import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin } from 'nuxt/app'

import { setRuntimeConfigValues } from '@/utils/runtimeConfig'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  const publicConfig = nuxtApp.$config.public as {
    apiBase?: string
    adsBase?: string
  }
  const appConfig = nuxtApp.$config.app as {
    baseURL?: string
  } | null

  setRuntimeConfigValues({
    apiBase: publicConfig.apiBase ?? '',
    adsBase: publicConfig.adsBase ?? '',
    appBase: appConfig?.baseURL ?? '/',
  })
})
