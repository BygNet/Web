import { api } from '@/api/client'
import { auth } from '@/auth/session'

let sessionHydrated = false
let hydrationPromise: Promise<boolean> | null = null

export function clearHydratedSessionState(): void {
  sessionHydrated = false
  hydrationPromise = null
}

export async function ensureHydratedSession(
  options: { force?: boolean } = {}
): Promise<boolean> {
  if (!auth.token) {
    clearHydratedSessionState()
    auth.user = null
    return false
  }

  if (!options.force && auth.user) {
    sessionHydrated = true
    return true
  }

  if (!options.force && sessionHydrated && auth.user) {
    return true
  }

  if (!options.force && hydrationPromise) {
    return hydrationPromise
  }

  async function hydrate(): Promise<boolean> {
    try {
      const res = await api('/auth/me')
      if (!res.ok) {
        throw new Error('Unauthorized')
      }

      auth.user = await res.json()
      sessionHydrated = true
      return true
    } catch {
      auth.token = null
      auth.user = null
      localStorage.removeItem('token')
      sessionHydrated = false
      return false
    } finally {
      hydrationPromise = null
    }
  }

  hydrationPromise = hydrate()

  return hydrationPromise
}
