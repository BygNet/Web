import { defineNuxtPlugin } from 'nuxt/app'
import type { Router } from 'vue-router'

import { setRouterInstance } from '@/router'

export default defineNuxtPlugin(nuxtApp => {
  setRouterInstance(nuxtApp.$router as Router)
})
