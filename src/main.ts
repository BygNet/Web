import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'
import App from '@/App.vue'
import router from '@/router'
import '@/styles/global.sass'

const bygWeb = createApp(App)
const head = createHead()
bygWeb.use(createPinia()).use(router).use(head).mount('#app')
