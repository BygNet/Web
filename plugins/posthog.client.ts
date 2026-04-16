import type { RuntimeConfig } from 'nuxt/schema'
import posthog, { type ConfigDefaults, type PostHog } from 'posthog-js'

import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  const runtimeConfig: RuntimeConfig = useRuntimeConfig()
  const posthogClient: PostHog = posthog.init(
    runtimeConfig.public.posthogPublicKey as string,
    {
      api_host: runtimeConfig.public.posthogHost as string,
      defaults: runtimeConfig.public.posthogDefaults as ConfigDefaults,
      person_profiles: 'always',
      // @ts-ignore
      loaded: (posthog: PostHog): void => {
        if (import.meta.env.MODE === 'development') posthog.debug()
      },
    }
  )

  return {
    provide: {
      posthog: (): PostHog => posthogClient,
    },
  }
})
