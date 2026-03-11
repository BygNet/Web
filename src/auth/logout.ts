import { api } from '@/api/client.ts'
import { clearHydratedSessionState } from '@/auth/hydrate'
import { auth } from '@/auth/session.ts'
import { clearUserCaches } from '@/data/caches'
import { clearMessagesState } from '@/data/messages'
import { clearNotificationsState } from '@/data/notifications'
import { clearProfileRequestState } from '@/data/profiles'
import { unsubscribePushAlerts } from '@/data/pushAlerts'

export async function logout() {
  await api('/auth/logout', { method: 'POST' })
  unsubscribePushAlerts().catch(error => {
    console.error('Push unsubscribe failed during logout', error)
  })

  auth.token = null
  auth.user = null
  localStorage.removeItem('token')
  clearUserCaches()
  clearMessagesState({ clearDevice: true })
  clearNotificationsState()
  clearProfileRequestState()
  clearHydratedSessionState()
}
