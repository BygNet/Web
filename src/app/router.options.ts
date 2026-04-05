import type { RouterConfig } from '@nuxt/schema'

const scrollPositions: Record<string, number> = {}
let lastScrollY = 0

if (import.meta.client) {
  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY
  })
}

export default <RouterConfig>{
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
