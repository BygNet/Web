/**
 * Nuxt environment variables wrapper
 * Provides consistent access to public environment variables
 * Works in both SSR and client contexts
 */
export const useEnv = () => {
  const config = useRuntimeConfig()
  return {
    apiBase: config.public.apiBase,
    adsBase: config.public.adsBase,
    asksBase: config.public.asksBase,
  }
}

export const getEnv = () => {
  if (process.server) {
    return {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.byg.a35.dev',
      adsBase: process.env.NUXT_PUBLIC_ADS_BASE || 'https://ads.byg.a35.dev',
      asksBase: process.env.NUXT_PUBLIC_ASKS_BASE || 'https://asks.byg.gg',
    }
  }
  // Client-side access via import.meta.env won't work, use composable
  throw new Error('Use useEnv() composable on client side')
}
