interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly NUXT_PUBLIC_API_BASE: string
  readonly NUXT_PUBLIC_ADS_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __AppVersion: string
