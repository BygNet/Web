import { createRouter, createWebHistory, type Router } from 'vue-router'
import BygSocial from '@/views/BygSocial.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ name: 'social', path: '/', component: BygSocial }],
})

export default router
