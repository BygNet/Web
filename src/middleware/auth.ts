import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'

import { ensureHydratedSession } from '@/auth/hydrate'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const hasSession = await ensureHydratedSession()
  if (!hasSession) {
    return navigateTo('/login')
  }
})
