import { auth, clearActiveSession } from '@/auth/session'
import { clearUserCaches } from '@/data/caches'
import { getApiBaseUrl, joinUrl } from '@/utils/runtimeConfig'

export async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  if (auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`)
  }

  headers.set('Content-Type', 'application/json')

  const res = await fetch(joinUrl(getApiBaseUrl(), path), {
    ...options,
    headers,
  })

  if (res.status === 401) {
    clearActiveSession()
    clearUserCaches()
  }

  return res
}
