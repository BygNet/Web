import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router'

const scrollPositions: Record<string, number> = {}
let lastScrollY = 0

const injectedRoutes: RouteRecordRaw[] = [
  {
    name: 'details',
    path: '/details/:slug',
    component: () => import('@/views/PostDetails.vue'),
  },
  {
    path: '/details',
    redirect: '/',
  },
  {
    name: 'image',
    path: '/image/:slug',
    component: () => import('@/views/ImageDetails.vue'),
  },
  {
    path: '/image',
    redirect: '/',
  },
  {
    name: 'userProfile',
    path: '/u/:username',
    component: () => import('@/views/BygProfile.vue'),
  },
]

if (import.meta.client) {
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY
  })
}

export default <RouterConfig>{
  routes: existingRoutes => {
    const routePaths = new Set(existingRoutes.map(route => route.path))
    const nextRoutes = [ ...existingRoutes ]

    for (const route of injectedRoutes) {
      if (routePaths.has(route.path)) continue
      nextRoutes.push(route)
    }

    return nextRoutes
  },
  scrollBehavior(to, from) {
    if (from.name) {
      scrollPositions[String(from.name)] = lastScrollY
    }

    if (to.name && scrollPositions[String(to.name)] !== undefined) {
      return {
        top: scrollPositions[String(to.name)],
        behavior: 'auto',
      }
    }

    return { top: 0, behavior: 'auto' }
  },
}
