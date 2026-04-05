import { defineNuxtPlugin } from 'nuxt/app'

import { ensureHydratedSession } from '@/auth/hydrate'
import { syncPushSubscription } from '@/data/pushAlerts'

export default defineNuxtPlugin(() => {
  ensureHydratedSession()
    .then(async hasSession => {
      if (!hasSession) return
      await syncPushSubscription()
    })
    .catch(error => {
      console.error('Startup session/push sync failed', error)
    })
})
