import { api } from '@/api/client.ts'
import { auth } from '@/auth/session.ts'

export async function logout() {
  await api('/auth/logout', { method: 'POST' })

  auth.token = null
  auth.user = null
  localStorage.removeItem('token')
}
