import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin } from 'nuxt/app'
import type { Router } from 'vue-router'

import { setRouterInstance } from '@/router'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  setRouterInstance(nuxtApp.$router as Router)
})
