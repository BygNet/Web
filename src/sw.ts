/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    revision: string | null
    url: string
  }>
}

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

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
  const path = payload.path ?? '/notifications'
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

  const path =
    (event.notification.data?.path as string | undefined) ?? '/notifications'

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
