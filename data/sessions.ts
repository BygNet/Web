import { api } from '@/api/client'
import { auth, clearActiveSession, upsertAccount } from '@/auth/session'

export interface BygSession {
  id: string
  createdAt: string
  lastUsedAt: string
  expiresAt: string | null
  ipAddress: string | null
  countryCode: string | null
  countryName: string | null
  deviceLabel: string | null
  current: boolean
}

export async function fetchSessions(): Promise<BygSession[]> {
  const response = await api('/auth/sessions')
  if (!response.ok) return []
  return (await response.json()) as BygSession[]
}

export async function revokeSession(session: BygSession): Promise<boolean> {
  const sessionId = session.id
  const response = await api(
    `/auth/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'DELETE',
    }
  )
  if (!response.ok) return false
  if (session.current) {
    clearActiveSession()
  }
  return true
}

export async function setSessionExpiry(
  session: BygSession,
  neverExpire: boolean
): Promise<boolean> {
  const response = await api(
    `/auth/sessions/${encodeURIComponent(session.id)}`,
    {
      method: 'PATCH',
      json: { neverExpire },
    }
  )
  if (!response.ok) return false

  const data = (await response.json()) as { token?: string }
  if (data.token && auth.user) upsertAccount(data.token, auth.user)
  session.expiresAt = neverExpire
    ? null
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  return true
}
