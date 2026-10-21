interface YandexSuggestResult {
  status?: string
  access_token?: string
  token?: string
  [key: string]: unknown
}

interface YandexSuggestHandler {
  (): Promise<YandexSuggestResult>
}

interface Window {
  YaAuthSuggest?: {
    init(
      oauthQueryParams: {
        client_id: string
        response_type: 'token'
        redirect_uri: string
      },
      tokenPageOrigin: string,
      suggestParams?: {
        view: 'button'
        parentId: string
        buttonView?: 'main' | 'additional' | 'icon' | 'iconBG'
        buttonTheme?: 'light' | 'dark'
        buttonSize?: string
        buttonBorderRadius?: number
        buttonIcon?: 'ya' | 'yaEng'
      }
    ): Promise<{ handler: YandexSuggestHandler }>
  }
  YaSendSuggestToken?: (origin: string, options?: { flag?: boolean }) => void
}
