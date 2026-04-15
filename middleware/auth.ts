import { ensureHydratedSession } from '@/auth/hydrate'
import { defineNuxtRouteMiddleware} from "#app";

export default defineNuxtRouteMiddleware(async () => {
  const hasSession: boolean = await ensureHydratedSession()
  if (!hasSession) {
    return navigateTo('/login')
  }
})
