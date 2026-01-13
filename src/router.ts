import { createRouter, createWebHistory, type Router } from 'vue-router'
import BygSocial from '@/views/BygSocial.vue'
import PostDetails from '@/views/PostDetails.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'social', path: '/', component: BygSocial },
    { name: 'details', path: '/details/:slug', component: PostDetails },
    { path: '/details', redirect: '/' },
  ],
})

export default router
