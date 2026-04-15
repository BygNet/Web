import { type Ref, ref } from 'vue'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import type { BygNotification } from '@/types/notifications'

const NOTIFICATIONS_CACHE_TTL = 45 * 1000
const DEFAULT_NOTIFICATIONS_LIMIT = 50

export const notificationsCache: Ref<BygNotification[] | null> = ref(null)
export const notificationsCacheTime: Ref<number> = ref(0)
export const notificationsLastReadAt: Ref<number> = ref(0)

let notificationsRequest: Promise<BygNotification[]> | null = null

function readTimestampStorageKey(): string {
  return `byg:notifications:lastRead:${auth.user?.id ?? 'guest'}`
}

export function loadNotificationReadState(): void {
  const raw = localStorage.getItem(readTimestampStorageKey())
  notificationsLastReadAt.value = raw ? Number(raw) || 0 : 0
}

export function markNotificationsRead(): void {
  const now = Date.now()
  notificationsLastReadAt.value = now
  localStorage.setItem(readTimestampStorageKey(), now.toString())
}

export function isUnreadNotification(notification: BygNotification): boolean {
  return (
    new Date(notification.createdDate).getTime() > notificationsLastReadAt.value
  )
}

export function unreadNotificationCount(
  notifications: BygNotification[]
): number {
  return notifications.filter(notification =>
    isUnreadNotification(notification)
  ).length
}

export function clearNotificationsState(): void {
  notificationsCache.value = null
  notificationsCacheTime.value = 0
  notificationsLastReadAt.value = 0
  notificationsRequest = null
}

export async function fetchNotifications(
  options: { force?: boolean } = {}
): Promise<BygNotification[]> {
  if (!auth.user || !auth.token) {
    clearNotificationsState()
    return []
  }

  if (
    !options.force &&
    notificationsCache.value &&
    Date.now() - notificationsCacheTime.value < NOTIFICATIONS_CACHE_TTL
  ) {
    return notificationsCache.value
  }

  if (!options.force && notificationsRequest) {
    return notificationsRequest
  }

  async function loadNotifications(): Promise<BygNotification[]> {
    const res = await api(`/notifications?limit=${DEFAULT_NOTIFICATIONS_LIMIT}`)

    if (!res.ok) {
      return []
    }

    const notifications = (await res.json()) as BygNotification[]
    notificationsCache.value = notifications
    notificationsCacheTime.value = Date.now()
    return notifications
  }

  notificationsRequest = loadNotifications().finally(() => {
    notificationsRequest = null
  })

  return notificationsRequest
}
