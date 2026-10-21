type BadgeCapableNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>
}

type BadgeCapableRegistration = ServiceWorkerRegistration & {
  setAppBadge?: (contents?: number) => Promise<void>
  clearAppBadge?: () => Promise<void>
}

export async function syncAppBadge(count: number): Promise<void> {
  if (typeof navigator === 'undefined') return

  const badgeCount = Math.max(0, Math.floor(count))
  const badgeNavigator = navigator as BadgeCapableNavigator

  try {
    if (badgeCount > 0 && badgeNavigator.setAppBadge) {
      await badgeNavigator.setAppBadge(badgeCount)
      return
    }

    if (
      badgeCount === 0 &&
      typeof badgeNavigator.clearAppBadge === 'function'
    ) {
      await badgeNavigator.clearAppBadge()
      return
    }

    if (!('serviceWorker' in navigator)) return

    const registration = (await navigator.serviceWorker.getRegistration()) as
      BadgeCapableRegistration | undefined
    if (!registration) return

    if (badgeCount > 0) {
      if (registration.setAppBadge) {
        await registration.setAppBadge(badgeCount)
        return
      }
    } else if (registration.clearAppBadge) {
      await registration.clearAppBadge()
      return
    }

    registration.active?.postMessage({
      type: 'byg:app-badge',
      count: badgeCount,
    })
  } catch {
    // App badges are progressive enhancement and may be unavailable or denied.
  }
}
