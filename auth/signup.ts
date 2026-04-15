import { api } from '@/api/client'
import { upsertAccount } from '@/auth/session'
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

  upsertAccount(data.token, data.user)
  fetchCurrentUserProfile()
    .then((): void => {})
    .catch((): void => {})
  syncPushSubscription()
    .then((): void => {})
    .catch((): void => {})
}
