import { ensureHydratedSession } from '@/auth/hydrate'
import { defineNuxtRouteMiddleware } from '#app'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) {
    return
  }
  const hasSession: boolean = await ensureHydratedSession()

  if (!hasSession) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'))
  }
})
