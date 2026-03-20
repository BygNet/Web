import { api } from '@/api/client'
import { auth, clearActiveSession, upsertAccount } from '@/auth/session'

let sessionHydrated = false
let hydrationPromise: Promise<boolean> | null = null
let hydratedToken: string | null = null

export function clearHydratedSessionState(): void {
  sessionHydrated = false
  hydrationPromise = null
  hydratedToken = null
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
    hydratedToken = auth.token
    return true
  }

  if (!options.force && sessionHydrated && auth.user && hydratedToken === auth.token) {
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

      const user = await res.json()
      const token = auth.token
      if (!token) {
        throw new Error('Missing token during hydration')
      }
      upsertAccount(token, user)
      sessionHydrated = true
      hydratedToken = token
      return true
    } catch {
      clearActiveSession()
      sessionHydrated = false
      hydratedToken = null
      return false
    } finally {
      hydrationPromise = null
    }
  }

  hydrationPromise = hydrate()

  return hydrationPromise
}
