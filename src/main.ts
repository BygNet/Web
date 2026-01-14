import '@/styles/global.sass'

import type { VueHeadClient } from '@unhead/vue'
import { createHead } from '@unhead/vue/client'
import { registerSW } from 'virtual:pwa-register'
import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'

registerSW({
  immediate: true,
})

const bygWeb = createApp(App)
const head: VueHeadClient = createHead()
bygWeb.use(router)
.use(head)
.mount('#app')
