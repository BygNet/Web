import { ensureHydratedSession } from '@/auth/hydrate'

export default defineRouteMiddleware(async () => {
  const hasSession = await ensureHydratedSession()
  if (!hasSession) {
    return navigateTo('/login')
  }
})
