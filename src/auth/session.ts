import type { BygUser } from '@bygnet/types'
import { reactive } from 'vue'

const ACCOUNTS_STORAGE_KEY = 'byg:auth:accounts'
const ACTIVE_ACCOUNT_STORAGE_KEY = 'byg:auth:active'
const LEGACY_TOKEN_STORAGE_KEY = 'token'

export type AuthUser = Pick<
  BygUser,
  'id' | 'email' | 'username' | 'avatarUrl' | 'bannerUrl' | 'bio'
> & {
  subscriptionState?: BygUser['subscriptionState'] | null
}

export interface AuthAccount {
  id: number
  token: string
  user: AuthUser
  lastUsed: number
}

function normalizeUser(user: Partial<AuthUser> | null | undefined): AuthUser | null {
  if (!user) return null
  if (typeof user.id !== 'number' || !Number.isFinite(user.id)) return null
  if (typeof user.username !== 'string' || !user.username.trim()) return null
  if (typeof user.email !== 'string' || !user.email.trim()) return null

  return {
    id: Math.trunc(user.id),
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    subscriptionState: user.subscriptionState ?? null,
    bannerUrl: user.bannerUrl ?? null,
    bio: user.bio ?? null,
  }
}

function normalizeAccount(raw: unknown): AuthAccount | null {
  if (!raw || typeof raw !== 'object') return null
  const candidate = raw as Partial<AuthAccount>
  if (typeof candidate.token !== 'string' || !candidate.token.trim()) return null
  const user = normalizeUser(candidate.user)
  if (!user) return null

  return {
    id: user.id,
    token: candidate.token,
    user,
    lastUsed:
      typeof candidate.lastUsed === 'number' && Number.isFinite(candidate.lastUsed)
        ? candidate.lastUsed
        : 0,
  }
}

function readStoredAccounts(): AuthAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(normalizeAccount)
      .filter((account): account is AuthAccount => !!account)
  } catch {
    return []
  }
}

function readStoredActiveAccountId(): number | null {
  const raw = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return null
  return Math.trunc(parsed)
}

function persistAccounts(accounts: AuthAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // ignore storage failures
  }
}

function persistActiveAccountId(accountId: number | null): void {
  if (accountId === null) {
    localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY)
    return
  }
  localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, String(accountId))
}

function pickDefaultAccount(accounts: AuthAccount[]): AuthAccount | null {
  if (!accounts.length) return null
  return [ ...accounts ].sort((a, b) => b.lastUsed - a.lastUsed)[0] ?? null
}

export const auth = reactive<{
  accounts: AuthAccount[]
  activeAccountId: number | null
  token: string | null
  user: AuthUser | null
}>({
  accounts: readStoredAccounts(),
  activeAccountId: readStoredActiveAccountId(),
  token: null,
  user: null,
})

export function clearLegacyToken(): void {
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
}

function applyActiveAccount(account: AuthAccount | null): void {
  auth.activeAccountId = account?.id ?? null
  auth.token = account?.token ?? null
  auth.user = account?.user ?? null
  persistActiveAccountId(auth.activeAccountId)
}

function resolveInitialSession(): void {
  const storedActiveId = auth.activeAccountId
  const storedActive =
    storedActiveId === null
      ? null
      : auth.accounts.find(account => account.id === storedActiveId) ?? null
  if (storedActive) {
    applyActiveAccount(storedActive)
    return
  }

  const fallback = pickDefaultAccount(auth.accounts)
  if (fallback) {
    applyActiveAccount(fallback)
    return
  }

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
  if (legacyToken) {
    auth.token = legacyToken
    auth.user = null
    auth.activeAccountId = null
    return
  }
}

resolveInitialSession()

export function getActiveAccount(): AuthAccount | null {
  if (auth.activeAccountId === null) return null
  return auth.accounts.find(account => account.id === auth.activeAccountId) ?? null
}

export function setActiveAccount(accountId: number | null): void {
  if (accountId === null) {
    applyActiveAccount(null)
    return
  }

  const account = auth.accounts.find(item => item.id === accountId) ?? null
  if (!account) {
    applyActiveAccount(null)
    return
  }

  account.lastUsed = Date.now()
  persistAccounts(auth.accounts)
  applyActiveAccount(account)
}

export function upsertAccount(
  token: string,
  user: AuthUser,
  options: { makeActive?: boolean } = {}
): void {
  const normalizedUser = normalizeUser(user)
  if (!normalizedUser || !token.trim()) return

  const existingIndex = auth.accounts.findIndex(
    account => account.id === normalizedUser.id
  )
  const updatedAccount: AuthAccount = {
    id: normalizedUser.id,
    token,
    user: normalizedUser,
    lastUsed: Date.now(),
  }

  if (existingIndex >= 0) {
    auth.accounts.splice(existingIndex, 1, {
      ...auth.accounts[existingIndex],
      ...updatedAccount,
    })
  } else {
    auth.accounts.push(updatedAccount)
  }

  persistAccounts(auth.accounts)
  clearLegacyToken()

  if (options.makeActive !== false) {
    setActiveAccount(updatedAccount.id)
  }
}

export function removeAccount(accountId: number): void {
  const existingIndex = auth.accounts.findIndex(
    account => account.id === accountId
  )
  if (existingIndex < 0) return

  const wasActive = auth.activeAccountId === accountId
  auth.accounts.splice(existingIndex, 1)
  persistAccounts(auth.accounts)

  if (!wasActive) return

  const nextAccount = pickDefaultAccount(auth.accounts)
  applyActiveAccount(nextAccount)
}

export function clearActiveSession(): void {
  if (auth.activeAccountId !== null) {
    removeAccount(auth.activeAccountId)
    return
  }
  auth.token = null
  auth.user = null
  clearLegacyToken()
  applyActiveAccount(null)
}
