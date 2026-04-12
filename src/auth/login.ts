import { api } from '@/api/client'
import { upsertAccount } from '@/auth/session'
import { fetchCurrentUserProfile } from '@/data/profiles'
import { syncPushSubscription } from '@/data/pushAlerts'

export type LoginResult = 'success' | 'two-factor-required'

export async function login(
  email: string,
  password: string,
  twoFactorCode?: string
): Promise<LoginResult> {
  const res: Response = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, twoFactorCode }),
  })

  if (res.status === 403) {
    const data = await res.json().catch(() => null)
    if (data?.requiresTwoFactor) {
      return 'two-factor-required'
    }
  }

  if (!res.ok) throw new Error('Login failed')

  const data = await res.json()

  upsertAccount(data.token, data.user)
  fetchCurrentUserProfile()
    .then((): void => {})
    .catch((): void => {})
  syncPushSubscription()
    .then((): void => {})
    .catch((): void => {})

  return 'success'
}
