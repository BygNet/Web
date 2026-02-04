interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_API_BASE: string
  readonly VITE_ADS_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __AppVersion: string
