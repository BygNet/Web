type RuntimeConfigValues = {
  apiBase: string
  adsBase: string
  appBase: string
}

const runtimeConfigValues: RuntimeConfigValues = {
  apiBase: '',
  adsBase: '',
  appBase: '/',
}

export function setRuntimeConfigValues(
  values: Partial<RuntimeConfigValues>
): void {
  runtimeConfigValues.apiBase = values.apiBase ?? runtimeConfigValues.apiBase
  runtimeConfigValues.adsBase = values.adsBase ?? runtimeConfigValues.adsBase
  runtimeConfigValues.appBase = values.appBase ?? runtimeConfigValues.appBase
}

function readNuxtConfigValue<TValue>(
  selector: (config: any) => TValue
): TValue | null {
  const nuxtConfig = (globalThis as any).__NUXT__?.config
  if (!nuxtConfig) return null

  try {
    return selector(nuxtConfig)
  } catch {
    return null
  }
}

export function getApiBaseUrl(): string {
  return (
    runtimeConfigValues.apiBase ||
    readNuxtConfigValue(config => config.public?.apiBase) ||
    process.env.NUXT_PUBLIC_API_BASE ||
    ''
  )
}

export function getAdsBaseUrl(): string {
  return (
    runtimeConfigValues.adsBase ||
    readNuxtConfigValue(config => config.public?.adsBase) ||
    process.env.NUXT_PUBLIC_ADS_BASE ||
    ''
  )
}

export function getAppBaseUrl(): string {
  return (
    runtimeConfigValues.appBase ||
    readNuxtConfigValue(config => config.app?.baseURL) ||
    process.env.NUXT_APP_BASE_URL ||
    '/'
  )
}

export function joinUrl(base: string, path: string): string {
  if (!base) return path
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}
