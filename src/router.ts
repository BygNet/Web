import { createRouter, createWebHistory, type Router } from 'vue-router'
import BygSocial from '@/views/BygSocial.vue'
import PostDetails from '@/views/PostDetails.vue'
import BygShop from '@/views/BygShop.vue'
import BygPicture from '@/views/BygPicture.vue'
import BygVideo from '@/views/BygVideo.vue'
import BygPro from '@/views/BygPro.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'social', path: '/', component: BygSocial },
    { name: 'details', path: '/details/:slug', component: PostDetails },
    { path: '/details', redirect: '/' },
    { name: 'picture', path: '/picture', component: BygPicture },
    { name: 'video', path: '/video', component: BygVideo },
    { name: 'shop', path: '/shop', component: BygShop },
    { name: 'pro', path: '/pro', component: BygPro },
  ],
})

export default router
