import { api } from '@/api/client'
import { auth } from '@/auth/session'
import type {
  BygPushPublicKeyResponse,
  BygPushSubscription,
} from '@/types/push'

let cachedPublicKey: string | null = null
let activeSyncRequest: Promise<boolean> | null = null
const PUSH_PUBLIC_KEY_STORAGE_KEY = 'byg:push:publicKey'
const SW_READY_TIMEOUT_MS = 2500

function supportsPushAlerts(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function base64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray.buffer
}

function getStoredPublicKey(): string | null {
  return localStorage.getItem(PUSH_PUBLIC_KEY_STORAGE_KEY)
}

function setStoredPublicKey(value: string | null): void {
  if (value === null) {
    localStorage.removeItem(PUSH_PUBLIC_KEY_STORAGE_KEY)
    return
  }

  localStorage.setItem(PUSH_PUBLIC_KEY_STORAGE_KEY, value)
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T | null> {
  return new Promise(resolve => {
    const timeoutId = window.setTimeout(() => resolve(null), timeoutMs)

    promise
      .then(value => {
        window.clearTimeout(timeoutId)
        resolve(value)
      })
      .catch(() => {
        window.clearTimeout(timeoutId)
        resolve(null)
      })
  })
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  const readyRegistration = await withTimeout(
    navigator.serviceWorker.ready,
    SW_READY_TIMEOUT_MS
  )
  if (readyRegistration) {
    return readyRegistration
  }

  const existing = await navigator.serviceWorker.getRegistration()
  if (existing?.active) {
    return existing
  }

  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  try {
    const registration = await navigator.serviceWorker.register(swUrl)
    const registeredReady = await withTimeout(
      navigator.serviceWorker.ready,
      SW_READY_TIMEOUT_MS
    )

    return registeredReady ?? registration
  } catch (error) {
    console.error('Failed to register service worker for push', error)
    return existing ?? null
  }
}

function toPushSubscriptionPayload(
  subscription: PushSubscription
): BygPushSubscription {
  const json = subscription.toJSON()
  return {
    endpoint: subscription.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    },
  }
}

async function getPublicKey(): Promise<string> {
  if (cachedPublicKey) return cachedPublicKey

  const response = await api('/push/public-key')
  if (!response.ok) {
    throw new Error('Failed to load push key')
  }

  const keyResponse = (await response.json()) as BygPushPublicKeyResponse
  cachedPublicKey = keyResponse.publicKey
  return keyResponse.publicKey
}

export function getPushPermissionState():
  | NotificationPermission
  | 'unsupported' {
  if (!supportsPushAlerts()) return 'unsupported'
  return Notification.permission
}

export async function syncPushSubscription(
  options: { requestPermission?: boolean } = {}
): Promise<boolean> {
  if (!supportsPushAlerts() || !auth.user || !auth.token) {
    return false
  }

  if (Notification.permission === 'denied') {
    return false
  }

  if (Notification.permission === 'default') {
    if (!options.requestPermission) {
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return false
    }
  }

  if (!options.requestPermission && activeSyncRequest) {
    return activeSyncRequest
  }

  async function runSyncTask(): Promise<boolean> {
    const registration = await getServiceWorkerRegistration()
    if (!registration) {
      return false
    }

    const publicKey = await getPublicKey()
    const storedPublicKey = getStoredPublicKey()
    let subscription = await registration.pushManager.getSubscription()

    if (subscription && storedPublicKey && storedPublicKey !== publicKey) {
      await subscription.unsubscribe()
      subscription = null
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToArrayBuffer(publicKey),
      })
    }

    const payload = toPushSubscriptionPayload(subscription)
    if (!payload.keys.p256dh || !payload.keys.auth) {
      throw new Error('Invalid push subscription keys')
    }

    const response = await api('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Failed to register push subscription')
    }

    setStoredPublicKey(publicKey)
    return true
  }

  const task = runSyncTask().finally(() => {
    if (!options.requestPermission) {
      activeSyncRequest = null
    }
  })

  if (!options.requestPermission) {
    activeSyncRequest = task
  }

  return task
}

export async function unsubscribePushAlerts(): Promise<void> {
  if (!supportsPushAlerts()) {
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return

  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    setStoredPublicKey(null)
    return
  }

  if (auth.token) {
    await api('/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    })
  }

  await subscription.unsubscribe()
  setStoredPublicKey(null)
}
