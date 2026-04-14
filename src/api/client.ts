import { auth, clearActiveSession } from '@/auth/session'
import { useEnv } from '@/utils/env'
import { clearUserCaches } from '@/data/caches'

export async function api(path: string, options: RequestInit = {}) {
  const { apiBase } = useEnv()
  const headers = new Headers(options.headers)

  if (auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`)
  }

  headers.set('Content-Type', 'application/json')

  const res = await fetch(apiBase + path, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    clearActiveSession()
    clearUserCaches()
  }

  return res
}
