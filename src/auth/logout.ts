import { api } from '@/api/client.ts'
import { auth } from '@/auth/session.ts'
import { clearUserCaches } from '@/data/caches'

export async function logout() {
  await api('/auth/logout', { method: 'POST' })

  auth.token = null
  auth.user = null
  localStorage.removeItem('token')
  clearUserCaches()
}
