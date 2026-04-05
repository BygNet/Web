import type { Router } from 'vue-router'

let routerInstance: Router | null = null

export function setRouterInstance(router: Router): void {
  routerInstance = router
}

function getRouter(): Router {
  if (!routerInstance) {
    throw new Error('Router instance has not been initialized yet')
  }

  return routerInstance
}

const router = new Proxy({} as Router, {
  get(_target, key) {
    const value = getRouter()[key as keyof Router]

    if (typeof value === 'function') {
      return value.bind(getRouter())
    }

    return value
  },
})

export default router
