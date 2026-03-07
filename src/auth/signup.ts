import { api } from '@/api/client.ts'
import { auth } from '@/auth/session.ts'
import { fetchCurrentUserProfile } from '@/data/profiles'
import { syncPushSubscription } from '@/data/pushAlerts'

export async function signup(
  email: string,
  username: string,
  password: string
) {
  const res = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      username,
      password,
    }),
  })

  if (!res.ok) throw new Error('Signup failed')

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
