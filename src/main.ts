import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/global.sass'
import { registerSW } from 'virtual:pwa-register'

registerSW({
  immediate: true,
})

const bygWeb = createApp(App)
const head = createHead()
bygWeb.use(router).use(head).mount('#app')
