import { ensureHydratedSession } from '@/auth/hydrate'
import { defineNuxtRouteMiddleware} from "#app";

const localePath = useLocalePath()

export default defineNuxtRouteMiddleware(async () => {
  const hasSession: boolean = await ensureHydratedSession()
  if (!hasSession) {
    return navigateTo(localePath('/login'))
  }
})
