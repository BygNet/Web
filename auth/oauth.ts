import { api } from '@/api/client'
import { auth } from '@/auth/session'

export type OAuthAction = 'signin' | 'link'

export interface OAuthProvider {
  id: string
  label: string
  icon: string
  clientId?: string | null
}

interface OAuthFlow {
  provider: string
  action: OAuthAction
  nonce: string
  serviceRedirectUri?: string
  serviceState?: string
}

const FLOW_STORAGE_KEY = 'byg:oauth:flow'

export function rememberOAuthFlow(flow: OAuthFlow): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(flow))
}

export function readOAuthFlow(): OAuthFlow | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const value = JSON.parse(sessionStorage.getItem(FLOW_STORAGE_KEY) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const flow = value as Partial<OAuthFlow>
    if (
      typeof flow.provider !== 'string' ||
      (flow.action !== 'signin' && flow.action !== 'link') ||
      typeof flow.nonce !== 'string'
    ) {
      return null
    }
    return flow as OAuthFlow
  } catch {
    return null
  }
}

export function clearOAuthFlow(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(FLOW_STORAGE_KEY)
  }
}

export async function loadOAuthProviders(): Promise<OAuthProvider[]> {
  const response = await api('/auth/oauth/providers')
  if (!response.ok) return []
  const value = (await response.json().catch(() => [])) as unknown
  return Array.isArray(value) ? (value as OAuthProvider[]) : []
}

export async function startOAuth(
  provider: OAuthProvider,
  action: OAuthAction,
  options: { serviceRedirectUri?: string; serviceState?: string } = {}
): Promise<void> {
  const nonce = crypto.randomUUID()
  rememberOAuthFlow({
    provider: provider.id,
    action,
    nonce,
    ...options,
  })

  const params = new URLSearchParams({
    nonce,
    action,
  })
  const response = await api(
    `/auth/oauth/${encodeURIComponent(provider.id)}/start?${params.toString()}`,
    { authToken: action === 'link' ? auth.token : null }
  )
  if (!response.ok) {
    clearOAuthFlow()
    throw new Error('OAuth start failed')
  }

  const result = (await response.json()) as { authorizationUrl?: string }
  if (!result.authorizationUrl) {
    clearOAuthFlow()
    throw new Error('OAuth authorization URL missing')
  }

  window.location.assign(result.authorizationUrl)
}

export async function exchangeOAuthGrant(input: {
  provider: string
  action: OAuthAction
  code: string
  twoFactorCode?: string
}): Promise<Response> {
  return await api(
    `/auth/oauth/${encodeURIComponent(input.provider)}/exchange`,
    {
      method: 'POST',
      json: {
        code: input.code,
        action: input.action,
        ...(input.twoFactorCode ? { twoFactorCode: input.twoFactorCode } : {}),
      },
    }
  )
}

export async function exchangeOAuthAccessToken(input: {
  provider: string
  accessToken: string
  twoFactorCode?: string
}): Promise<Response> {
  return await api(`/auth/oauth/${encodeURIComponent(input.provider)}/token`, {
    method: 'POST',
    json: {
      accessToken: input.accessToken,
      ...(input.twoFactorCode ? { twoFactorCode: input.twoFactorCode } : {}),
    },
  })
}
