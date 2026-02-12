import { api } from '@/api/client'
import { auth } from '@/auth/session'
import { setCachedCurrentUser } from '@/data/caches'

export async function login(email: string, password: string): Promise<void> {
  const res: Response = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error('Login failed')

  const data = await res.json()

  auth.token = data.token
  auth.user = data.user

  localStorage.setItem('token', data.token)
  setCachedCurrentUser(data.user)
}
