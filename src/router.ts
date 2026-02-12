import { createRouter, createWebHistory, type Router } from 'vue-router'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import BygLink from '@/views/BygLink.vue'
import BygPicture from '@/views/BygPicture.vue'
import BygPro from '@/views/BygPro.vue'
import BygProfile from '@/views/BygProfile.vue'
import BygSettings from '@/views/BygSettings.vue'
import BygShop from '@/views/BygShop.vue'
import BygSocial from '@/views/BygSocial.vue'
import BygTerms from '@/views/BygTerms.vue'
import ImageDetails from '@/views/ImageDetails.vue'
import LoginPage from '@/views/LoginPage.vue'
import MyBygProfile from '@/views/MyBygProfile.vue'
import PostDetails from '@/views/PostDetails.vue'
import SignupPage from '@/views/SignupPage.vue'

// Scroll position storage per route
const scrollPositions: { [key: string]: number } = {}
let lastScrollY = 0

const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'terms', path: '/terms', component: BygTerms },
    { name: 'social', path: '/', component: BygSocial },
    { name: 'details', path: '/details/:slug', component: PostDetails },
    {
      name: 'image',
      path: '/image/:slug',
      component: ImageDetails,
    },
    { path: '/details', redirect: '/' },
    { path: '/image', redirect: '/' },
    { name: 'picture', path: '/picture', component: BygPicture },
    { name: 'link', path: '/link', component: BygLink },
    { name: 'shop', path: '/shop', component: BygShop },
    {
      name: 'profile',
      path: '/me',
      component: MyBygProfile,
    },
    {
      name: 'userProfile',
      path: '/u/:username',
      component: BygProfile,
    },
    {
      name: 'settings',
      path: '/settings',
      component: BygSettings,
      meta: { requiresAuth: true },
    },
    { name: 'login', path: '/login', component: LoginPage },
    { name: 'signup', path: '/signup', component: SignupPage },
    { name: 'pro', path: '/pro', component: BygPro },
  ],
  scrollBehavior(to, from) {
    // Save the scroll position of the page we're leaving
    if (from.name) {
      scrollPositions[from.name as string] = lastScrollY
    }

    // If returning to a cached page, return the saved position
    if (to.name && scrollPositions[to.name as string] !== undefined) {
      return { top: scrollPositions[to.name as string], behavior: 'auto' }
    }

    // New pages start at top
    return { top: 0, behavior: 'auto' }
  },
})

// Track scroll position as user scrolls
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY
  })
}

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
