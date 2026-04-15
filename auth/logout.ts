import { api } from '@/api/client'
import { resetActiveAccountState } from '@/auth/accountState'
import { auth, clearActiveSession } from '@/auth/session'
import { unsubscribePushAlerts } from '@/data/pushAlerts'

export async function logout() {
  const activeUserId = auth.user?.id
  await api('/auth/logout', { method: 'POST' })
  unsubscribePushAlerts().catch(error => {
    console.error('Push unsubscribe failed during logout', error)
  })

  clearActiveSession()
  resetActiveAccountState({ clearDevice: true, userId: activeUserId })
}
