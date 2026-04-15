import { clearHydratedSessionState } from '@/auth/hydrate'
import { clearUserCaches } from '@/data/caches'
import { clearMessagesState } from '@/data/messages'
import { clearNotificationsState } from '@/data/notifications'
import { clearProfileRequestState } from '@/data/profiles'

export function resetActiveAccountState(
  options: { clearDevice?: boolean; userId?: number } = {}
): void {
  clearUserCaches()
  clearMessagesState({
    clearDevice: options.clearDevice,
    userId: options.userId,
  })
  clearNotificationsState()
  clearProfileRequestState()
  clearHydratedSessionState()
}
