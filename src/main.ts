import '@/styles/global.sass'
import '@/utils/marked'

import type { VueHeadClient } from '@unhead/vue'
import { createHead } from '@unhead/vue/client'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import App from '@/App.vue'
import { ensureHydratedSession } from '@/auth/hydrate'
import { syncPushSubscription } from '@/data/pushAlerts'
import router from '@/router'

registerSW({
  immediate: true,
})

const bygWeb = createApp(App)
const head: VueHeadClient = createHead()

ensureHydratedSession()
  .then(async hasSession => {
    if (!hasSession) return
    await syncPushSubscription()
  })
  .catch(error => {
    console.error('Startup session/push sync failed', error)
  })

bygWeb.use(router).use(head).mount('#app')
