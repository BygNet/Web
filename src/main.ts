import '@/styles/global.sass'

import type { VueHeadClient } from '@unhead/vue'
import { createHead } from '@unhead/vue/client'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import { api } from '@/api/client'
import App from '@/App.vue'
import { auth } from '@/auth/session'
import router from '@/router'

registerSW({
  immediate: true,
})

const bygWeb = createApp(App)
const head: VueHeadClient = createHead()

async function hydrateSession(): Promise<void> {
  if (!auth.token) return

  try {
    const res: Response = await api('/auth/me')
    if (!res.ok) throw new Error()

    auth.user = await res.json()
  } catch {
    auth.token = null
    auth.user = null
    localStorage.removeItem('token')
  }
}

hydrateSession().then((): void => {})

bygWeb.use(router).use(head).mount('#app')
