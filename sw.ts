// / <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null
    url: string
  }>
}

type BadgeCapableServiceWorkerRegistration = ServiceWorkerRegistration & {
  setAppBadge?: (contents?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', event => {
  const data = event.data as { type?: string; count?: number } | null
  if (data?.type !== 'byg:app-badge') return

  const count = Math.max(0, Math.floor(Number(data.count) || 0))
  const registration =
    self.registration as BadgeCapableServiceWorkerRegistration

  event.waitUntil(
    count > 0
      ? (registration.setAppBadge?.(count) ?? Promise.resolve())
      : (registration.clearAppBadge?.() ?? Promise.resolve())
  )
})

self.addEventListener('push', event => {
  if (!event.data) return

  const payload = event.data.json() as {
    title?: string
    body?: string
    path?: string
    tag?: string
  }

  const title = payload.title ?? 'Byg alert'
  const body = payload.body ?? 'You have a new alert.'
  const path = payload.path ?? '/inbox'
  const tag = payload.tag ?? 'byg-alert'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logos/BygLogo-Pwa.png',
      badge: '/favicon.ico',
      tag,
      data: { path },
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const path = (event.notification.data?.path as string | undefined) ?? '/inbox'

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then(clients => {
        for (const client of clients) {
          const appClient = client as WindowClient
          const url = new URL(appClient.url)
          if (url.origin !== self.location.origin) continue

          appClient.navigate(path)
          return appClient.focus()
        }

        return self.clients.openWindow(path)
      })
  )
})
