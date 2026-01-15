import { createRouter, createWebHistory, type Router } from 'vue-router'

import BygLink from '@/views/BygLink.vue'
import BygPicture from '@/views/BygPicture.vue'
import BygPro from '@/views/BygPro.vue'
import BygProfile from '@/views/BygProfile.vue'
import BygShop from '@/views/BygShop.vue'
import BygSocial from '@/views/BygSocial.vue'
import PostDetails from '@/views/PostDetails.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'social', path: '/', component: BygSocial },
    { name: 'details', path: '/details/:slug', component: PostDetails },
    { path: '/details', redirect: '/' },
    { name: 'picture', path: '/picture', component: BygPicture },
    { name: 'link', path: '/link', component: BygLink },
    { name: 'shop', path: '/shop', component: BygShop },
    { name: 'profile', path: '/me', component: BygProfile },
    { name: 'pro', path: '/pro', component: BygPro },
  ],
})

export default router
