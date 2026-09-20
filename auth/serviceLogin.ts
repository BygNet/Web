import { api } from '@/api/client'

export async function completeServiceLogin(
  redirectUri: unknown,
  state: unknown,
  token?: string | null
): Promise<string | null> {
  if (typeof redirectUri !== 'string' || !redirectUri) return null

  const response = await api('/auth/grants', {
    method: 'POST',
    json: { redirectUri },
    ...(token !== undefined ? { authToken: token } : {}),
  })
  if (!response.ok) return null

  const grant = (await response.json()) as { code: string; redirectUri: string }
  const callback = new URL(grant.redirectUri)
  callback.searchParams.set('code', grant.code)
  if (typeof state === 'string' && state)
    callback.searchParams.set('state', state)
  return callback.toString()
}
