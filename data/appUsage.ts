import { type BygPageMeta, BygPages, MorePages } from '@/data/pages'

const APP_USAGE_STORAGE_KEY = 'byg:app-usage:v1'

function appPathFromTarget(target: string): string {
  return target.split(/[?#]/, 1)[0] ?? target
}

function trackedApps(): BygPageMeta[] {
  const seen = new Set<string>()

  return [ ...BygPages, ...MorePages ].filter(app => {
    if (!app.path || seen.has(app.path)) return false
    seen.add(app.path)
    return true
  })
}

function readUsage(): Record<string, number> {
  if (typeof window === 'undefined') return {}

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(APP_USAGE_STORAGE_KEY) ?? '{}'
    ) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([ path, count ]) =>
          typeof path === 'string' &&
          typeof count === 'number' &&
          Number.isFinite(count) &&
          count > 0
      )
    ) as Record<string, number>
  } catch {
    return {}
  }
}

function writeUsage(usage: Record<string, number>): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(APP_USAGE_STORAGE_KEY, JSON.stringify(usage))
  } catch {
    // App suggestions are an enhancement and should never block navigation.
  }
}

export function recordAppVisit(target: string): void {
  const path = appPathFromTarget(target)
  if (!trackedApps().some(app => app.path === path)) return

  const usage = readUsage()
  usage[path] = (usage[path] ?? 0) + 1
  writeUsage(usage)
}

export function getMostVisitedApps(limit = 4): BygPageMeta[] {
  const usage = readUsage()
  const apps = trackedApps()
  const appOrder = new Map(apps.map((app, index) => [ app.path, index ]))

  return apps
    .sort((left, right) => {
      const usageDifference = (usage[right.path] ?? 0) - (usage[left.path] ?? 0)
      if (usageDifference !== 0) return usageDifference
      return appOrder.get(left.path)! - appOrder.get(right.path)!
    })
    .slice(0, limit)
}
