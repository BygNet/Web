import { auth } from '@/auth/session'

export async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  if (auth.token) {
    headers.set('Authorization', `Bearer ${auth.token}`)
  }

  headers.set('Content-Type', 'application/json')

  const res = await fetch(import.meta.env.VITE_API_BASE + path, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    auth.token = null
    auth.user = null
    localStorage.removeItem('token')
  }

  return res
}
