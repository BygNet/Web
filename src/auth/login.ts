import { api } from '@/api/client'
import { auth } from '@/auth/session'
import { fetchCurrentUserProfile } from '@/data/profiles'
import { syncPushSubscription } from '@/data/pushAlerts'

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
  fetchCurrentUserProfile()
    .then((): void => {})
    .catch((): void => {})
  syncPushSubscription()
    .then((): void => {})
    .catch((): void => {})
}
