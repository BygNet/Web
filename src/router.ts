import { createRouter, createWebHistory, type Router } from 'vue-router'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import BygLink from '@/views/BygLink.vue'
import BygPicture from '@/views/BygPicture.vue'
import BygPro from '@/views/BygPro.vue'
import BygProfile from '@/views/BygProfile.vue'
import BygShop from '@/views/BygShop.vue'
import BygSocial from '@/views/BygSocial.vue'
import LoginPage from '@/views/LoginPage.vue'
import PostDetails from '@/views/PostDetails.vue'
import SignupPage from '@/views/SignupPage.vue'

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'social', path: '/', component: BygSocial },
    { name: 'details', path: '/details/:slug', component: PostDetails },
    { path: '/details', redirect: '/' },
    { name: 'picture', path: '/picture', component: BygPicture },
    { name: 'link', path: '/link', component: BygLink },
    { name: 'shop', path: '/shop', component: BygShop },
    {
      name: 'profile',
      path: '/me',
      component: BygProfile,
    },
    { name: 'login', path: '/login', component: LoginPage },
    { name: 'signup', path: '/signup', component: SignupPage },
    { name: 'pro', path: '/pro', component: BygPro },
  ],
})

let sessionChecked = false

router.beforeEach(async to => {
  if (!to.meta.requiresAuth) return true

  if (!auth.token) {
    return { name: 'login' }
  }

  if (!sessionChecked) {
    sessionChecked = true

    const res = await api('/auth/me')
    if (!res.ok) {
      auth.token = null
      auth.user = null
      localStorage.removeItem('token')
      return { name: 'login' }
    }

    auth.user = await res.json()
  }

  return true
})

export default router
