import { api } from '@/api/client'
import { auth } from '@/auth/session'
import type {
  BygMessage,
  BygMessageConversation,
  BygMessageConversationInfoRequest,
  BygMessageConversationInviteRequest,
  BygMessageDirectConversationRequest,
  BygMessageGroupConversationRequest,
  BygMessageLiveClientEvent,
  BygMessageLiveServerEvent,
  BygMessageSendRequest,
  BygMessageShareTarget,
  BygMessageThread,
} from '@/types/messages'
import { useEnv } from '@/utils/env'

const THREAD_CACHE_TTL_MS = 20 * 60 * 1000
const CONVERSATION_CACHE_TTL_MS = 12 * 60 * 60 * 1000
const SHARE_TARGET_CACHE_TTL_MS = 45 * 60 * 1000
const THREAD_CACHE_STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CONVERSATION_CACHE_STALE_TTL_MS = 14 * 24 * 60 * 60 * 1000
const SHARE_TARGET_CACHE_STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MESSAGE_STORAGE_PREFIX = 'byg:messages-cache'

interface TimedCache<TValue> {
  value: TValue
  timestamp: number
}

let threadsCache: TimedCache<BygMessageThread[]> | null = null
let shareTargetsCache: TimedCache<BygMessageShareTarget[]> | null = null
const conversationCache = new Map<string, TimedCache<BygMessageConversation>>()

let threadRequest: Promise<BygMessageThread[]> | null = null
let shareTargetRequest: Promise<BygMessageShareTarget[]> | null = null
const conversationRequests = new Map<
  string,
  Promise<BygMessageConversation | null>
>()

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

function getCacheUserId(): number | null {
  const userId = auth.user?.id
  if (typeof userId !== 'number' || !Number.isFinite(userId)) {
    return null
  }
  return Math.trunc(userId)
}

function isCacheFresh(cache: TimedCache<unknown>, ttlMs: number): boolean {
  return Date.now() - cache.timestamp < ttlMs
}

function isCacheUsable(cache: TimedCache<unknown>, ttlMs: number): boolean {
  return Date.now() - cache.timestamp < ttlMs
}

function buildCacheKey(userId: number, scope: string): string {
  return `${MESSAGE_STORAGE_PREFIX}:${userId}:${scope}`
}

function readLocalCache<TValue>(key: string): TimedCache<TValue> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<TimedCache<TValue>>
    if (typeof parsed?.timestamp !== 'number') return null
    if (!('value' in parsed)) return null

    return {
      value: parsed.value as TValue,
      timestamp: parsed.timestamp,
    }
  } catch {
    return null
  }
}

function writeLocalCache<TValue>(key: string, cache: TimedCache<TValue>): void {
  try {
    localStorage.setItem(key, JSON.stringify(cache))
  } catch {
    // ignore storage write failures
  }
}

function removeLocalCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore storage removal failures
  }
}

function threadsCacheKey(userId: number): string {
  return buildCacheKey(userId, 'threads')
}

function shareTargetsCacheKey(userId: number): string {
  return buildCacheKey(userId, 'share-targets')
}

function conversationCacheKey(userId: number, key: string): string {
  return buildCacheKey(userId, `conversation:${key}`)
}

function conversationUsernameKey(username: string): string {
  return `username:${normalizeUsername(username)}`
}

function conversationIdKey(conversationId: number): string {
  return `id:${conversationId}`
}

function readThreadsDeviceCache(
  userId: number
): TimedCache<BygMessageThread[]> | null {
  const cache = readLocalCache<BygMessageThread[]>(threadsCacheKey(userId))
  if (!cache || !Array.isArray(cache.value)) {
    return null
  }
  return cache
}

function writeThreadsDeviceCache(
  userId: number,
  cache: TimedCache<BygMessageThread[]>
): void {
  writeLocalCache(threadsCacheKey(userId), cache)
}

function readConversationDeviceCache(
  userId: number,
  key: string
): TimedCache<BygMessageConversation> | null {
  const cache = readLocalCache<BygMessageConversation>(
    conversationCacheKey(userId, key)
  )
  if (!cache || !cache.value || !Array.isArray(cache.value.messages)) {
    return null
  }
  return cache
}

function writeConversationDeviceCache(
  userId: number,
  key: string,
  cache: TimedCache<BygMessageConversation>
): void {
  writeLocalCache(conversationCacheKey(userId, key), cache)
}

function readShareTargetsDeviceCache(
  userId: number
): TimedCache<BygMessageShareTarget[]> | null {
  const cache = readLocalCache<BygMessageShareTarget[]>(
    shareTargetsCacheKey(userId)
  )
  if (!cache || !Array.isArray(cache.value)) {
    return null
  }
  return cache
}

function writeShareTargetsDeviceCache(
  userId: number,
  cache: TimedCache<BygMessageShareTarget[]>
): void {
  writeLocalCache(shareTargetsCacheKey(userId), cache)
}

function clearDeviceMessageCache(userId?: number): void {
  try {
    const keysToRemove: string[] = []
    const prefix = userId
      ? `${MESSAGE_STORAGE_PREFIX}:${userId}:`
      : `${MESSAGE_STORAGE_PREFIX}:`
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key || !key.startsWith(prefix)) {
        continue
      }
      keysToRemove.push(key)
    }

    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch {
    // ignore storage read failures
  }
}

function buildMessagesSocketUrl(): string {
  const { apiBase } = useEnv()
  const base = String(apiBase).replace(/\/+$/, '')

  if (base.startsWith('https://')) {
    return `${base.replace('https://', 'wss://')}/messages/live`
  }

  if (base.startsWith('http://')) {
    return `${base.replace('http://', 'ws://')}/messages/live`
  }

  return `${apiBase}/messages/live`
}

export function clearMessagesState(
  options: { clearDevice?: boolean; userId?: number } = {}
): void {
  threadsCache = null
  shareTargetsCache = null
  conversationCache.clear()
  threadRequest = null
  shareTargetRequest = null
  conversationRequests.clear()
  if (options.clearDevice) {
    clearDeviceMessageCache(options.userId)
  }
}

export async function fetchMessageThreads(
  options: { force?: boolean } = {}
): Promise<BygMessageThread[]> {
  if (!auth.user || !auth.token) {
    clearMessagesState()
    return []
  }

  const userId = getCacheUserId()
  if (userId === null) {
    clearMessagesState()
    return []
  }
  const cacheUserId = userId

  if (
    !options.force &&
    threadsCache &&
    isCacheFresh(threadsCache, THREAD_CACHE_TTL_MS)
  ) {
    return threadsCache.value
  }

  if (!options.force && threadRequest) {
    return threadRequest
  }

  async function loadThreads(): Promise<BygMessageThread[]> {
    const res = await api('/messages/threads?limit=30')
    if (!res.ok) {
      return []
    }

    const cacheEntry: TimedCache<BygMessageThread[]> = {
      value: (await res.json()) as BygMessageThread[],
      timestamp: Date.now(),
    }
    threadsCache = cacheEntry
    writeThreadsDeviceCache(cacheUserId, cacheEntry)

    return cacheEntry.value
  }

  if (!options.force) {
    const deviceCache = readThreadsDeviceCache(cacheUserId)
    if (deviceCache && isCacheUsable(deviceCache, THREAD_CACHE_STALE_TTL_MS)) {
      threadsCache = deviceCache

      if (!isCacheFresh(deviceCache, THREAD_CACHE_TTL_MS)) {
        threadRequest = loadThreads().finally(() => {
          threadRequest = null
        })
      }

      return deviceCache.value
    }
  }

  threadRequest = loadThreads().finally(() => {
    threadRequest = null
  })

  return threadRequest
}

export async function fetchMessageConversation(
  username: string,
  options: { force?: boolean } = {}
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const userId = getCacheUserId()
  if (userId === null) {
    return null
  }
  const cacheUserId = userId

  const conversationKey = conversationUsernameKey(username)
  if (conversationKey === 'username:') {
    return null
  }

  const cachedConversation = conversationCache.get(conversationKey)
  if (
    !options.force &&
    cachedConversation &&
    isCacheFresh(cachedConversation, CONVERSATION_CACHE_TTL_MS)
  ) {
    return cachedConversation.value
  }

  if (!options.force && conversationRequests.has(conversationKey)) {
    return conversationRequests.get(conversationKey) ?? null
  }

  async function loadConversation(): Promise<BygMessageConversation | null> {
    const res = await api(
      `/messages/conversation/${encodeURIComponent(
        normalizeUsername(username)
      )}?limit=200`
    )
    if (!res.ok) {
      return null
    }

    const cacheEntry: TimedCache<BygMessageConversation> = {
      value: (await res.json()) as BygMessageConversation,
      timestamp: Date.now(),
    }
    conversationCache.set(conversationKey, cacheEntry)
    if (cacheEntry.value.conversationId > 0) {
      conversationCache.set(
        conversationIdKey(cacheEntry.value.conversationId),
        cacheEntry
      )
    }
    writeConversationDeviceCache(cacheUserId, conversationKey, cacheEntry)

    return cacheEntry.value
  }

  if (!options.force) {
    const deviceCache = readConversationDeviceCache(
      cacheUserId,
      conversationKey
    )
    if (
      deviceCache &&
      isCacheUsable(deviceCache, CONVERSATION_CACHE_STALE_TTL_MS)
    ) {
      conversationCache.set(conversationKey, deviceCache)

      if (!isCacheFresh(deviceCache, CONVERSATION_CACHE_TTL_MS)) {
        const request = loadConversation().finally(() => {
          conversationRequests.delete(conversationKey)
        })
        conversationRequests.set(conversationKey, request)
      }

      return deviceCache.value
    }
  }

  const request = loadConversation().finally(() => {
    conversationRequests.delete(conversationKey)
  })
  conversationRequests.set(conversationKey, request)
  return request
}

export async function fetchMessageConversationById(
  conversationId: number,
  options: { force?: boolean } = {}
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const userId = getCacheUserId()
  if (userId === null || !Number.isFinite(conversationId)) {
    return null
  }
  const cacheUserId = userId
  const normalizedConversationId = Math.trunc(conversationId)
  const cacheKey = conversationIdKey(normalizedConversationId)

  const cachedConversation = conversationCache.get(cacheKey)
  if (
    !options.force &&
    cachedConversation &&
    isCacheFresh(cachedConversation, CONVERSATION_CACHE_TTL_MS)
  ) {
    return cachedConversation.value
  }

  if (!options.force && conversationRequests.has(cacheKey)) {
    return conversationRequests.get(cacheKey) ?? null
  }

  async function loadConversation(): Promise<BygMessageConversation | null> {
    const res = await api(
      `/messages/conversations/${normalizedConversationId}?limit=200`
    )
    if (!res.ok) {
      return null
    }

    const cacheEntry: TimedCache<BygMessageConversation> = {
      value: (await res.json()) as BygMessageConversation,
      timestamp: Date.now(),
    }
    conversationCache.set(cacheKey, cacheEntry)
    writeConversationDeviceCache(cacheUserId, cacheKey, cacheEntry)

    return cacheEntry.value
  }

  if (!options.force) {
    const deviceCache = readConversationDeviceCache(cacheUserId, cacheKey)
    if (
      deviceCache &&
      isCacheUsable(deviceCache, CONVERSATION_CACHE_STALE_TTL_MS)
    ) {
      conversationCache.set(cacheKey, deviceCache)

      if (!isCacheFresh(deviceCache, CONVERSATION_CACHE_TTL_MS)) {
        const request = loadConversation().finally(() => {
          conversationRequests.delete(cacheKey)
        })
        conversationRequests.set(cacheKey, request)
      }

      return deviceCache.value
    }
  }

  const request = loadConversation().finally(() => {
    conversationRequests.delete(cacheKey)
  })
  conversationRequests.set(cacheKey, request)
  return request
}

export async function fetchMessageShareTargets(
  options: { force?: boolean } = {}
): Promise<BygMessageShareTarget[]> {
  if (!auth.user || !auth.token) {
    return []
  }

  const userId = getCacheUserId()
  if (userId === null) {
    return []
  }
  const cacheUserId = userId

  if (
    !options.force &&
    shareTargetsCache &&
    isCacheFresh(shareTargetsCache, SHARE_TARGET_CACHE_TTL_MS)
  ) {
    return shareTargetsCache.value
  }

  if (!options.force && shareTargetRequest) {
    return shareTargetRequest
  }

  async function loadShareTargets(): Promise<BygMessageShareTarget[]> {
    const res = await api('/messages/share-targets?limit=24')
    if (!res.ok) {
      return []
    }

    const cacheEntry: TimedCache<BygMessageShareTarget[]> = {
      value: (await res.json()) as BygMessageShareTarget[],
      timestamp: Date.now(),
    }
    shareTargetsCache = cacheEntry
    writeShareTargetsDeviceCache(cacheUserId, cacheEntry)

    return cacheEntry.value
  }

  if (!options.force) {
    const deviceCache = readShareTargetsDeviceCache(cacheUserId)
    if (
      deviceCache &&
      isCacheUsable(deviceCache, SHARE_TARGET_CACHE_STALE_TTL_MS)
    ) {
      shareTargetsCache = deviceCache

      if (!isCacheFresh(deviceCache, SHARE_TARGET_CACHE_TTL_MS)) {
        shareTargetRequest = loadShareTargets().finally(() => {
          shareTargetRequest = null
        })
      }

      return deviceCache.value
    }
  }

  shareTargetRequest = loadShareTargets().finally(() => {
    shareTargetRequest = null
  })

  return shareTargetRequest
}

function invalidateThreadCaches(): void {
  threadsCache = null
  shareTargetsCache = null
  const userId = getCacheUserId()
  if (userId !== null) {
    removeLocalCache(threadsCacheKey(userId))
    removeLocalCache(shareTargetsCacheKey(userId))
  }
}

function cacheConversation(conversation: BygMessageConversation): void {
  const userId = getCacheUserId()
  const cacheEntry: TimedCache<BygMessageConversation> = {
    value: conversation,
    timestamp: Date.now(),
  }
  const idKey = conversationIdKey(conversation.conversationId)

  conversationCache.set(idKey, cacheEntry)
  if (userId !== null) {
    writeConversationDeviceCache(userId, idKey, cacheEntry)
  }
}

export async function getOrCreateDirectConversation(
  payload: BygMessageDirectConversationRequest
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api('/messages/conversations/direct', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    return null
  }

  const conversation = (await res.json()) as BygMessageConversation
  cacheConversation(conversation)
  invalidateThreadCaches()
  return conversation
}

export async function createGroupConversation(
  payload: BygMessageGroupConversationRequest
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api('/messages/conversations/group', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    return null
  }

  const conversation = (await res.json()) as BygMessageConversation
  cacheConversation(conversation)
  invalidateThreadCaches()
  return conversation
}

export async function inviteGroupConversationMember(
  conversationId: number,
  payload: BygMessageConversationInviteRequest
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api(`/messages/conversations/${conversationId}/members`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    return null
  }

  const conversation = (await res.json()) as BygMessageConversation
  cacheConversation(conversation)
  invalidateThreadCaches()
  return conversation
}

export async function removeGroupConversationMember(
  conversationId: number,
  userId: number
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api(
    `/messages/conversations/${conversationId}/members/${userId}`,
    {
      method: 'DELETE',
    }
  )
  if (!res.ok) {
    return null
  }

  const conversation = (await res.json()) as BygMessageConversation
  cacheConversation(conversation)
  invalidateThreadCaches()
  return conversation
}

export async function updateGroupConversationInfo(
  conversationId: number,
  payload: BygMessageConversationInfoRequest
): Promise<BygMessageConversation | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api(`/messages/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    return null
  }

  const conversation = (await res.json()) as BygMessageConversation
  cacheConversation(conversation)
  invalidateThreadCaches()
  return conversation
}

export async function sendMessage(
  payload: BygMessageSendRequest
): Promise<BygMessage | null> {
  if (!auth.user || !auth.token) {
    return null
  }

  const res = await api('/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    return null
  }

  const message = (await res.json()) as BygMessage

  invalidateThreadCaches()
  const userId = getCacheUserId()
  const keys = [ conversationIdKey(message.conversationId) ]
  if (message.recipientId !== null) {
    keys.push(conversationUsernameKey(message.senderUsername))
    keys.push(conversationUsernameKey(message.recipientUsername))
  }

  for (const key of keys) {
    const existingConversation =
      conversationCache.get(key) ??
      (userId !== null ? readConversationDeviceCache(userId, key) : null)
    if (!existingConversation) continue

    if (
      existingConversation.value.messages.some(
        existingMessage => existingMessage.id === message.id
      )
    ) {
      continue
    }

    existingConversation.value = {
      ...existingConversation.value,
      messages: [ ...existingConversation.value.messages, message ],
    }
    existingConversation.timestamp = Date.now()
    conversationCache.set(key, existingConversation)
    if (userId !== null) {
      writeConversationDeviceCache(userId, key, existingConversation)
    }
  }

  return message
}

export function createMessagesSocket(
  onEvent: (event: BygMessageLiveServerEvent) => void,
  onConnectedChange?: (connected: boolean) => void
): WebSocket | null {
  if (!auth.token) {
    onConnectedChange?.(false)
    return null
  }

  const ws = new WebSocket(buildMessagesSocketUrl())

  ws.addEventListener('open', () => {
    const token = auth.token
    if (!token) {
      onConnectedChange?.(false)
      ws.close()
      return
    }

    const authPayload: BygMessageLiveClientEvent = {
      type: 'auth',
      token,
    }
    ws.send(JSON.stringify(authPayload))
  })

  ws.addEventListener('close', () => {
    onConnectedChange?.(false)
  })

  ws.addEventListener('error', () => {
    onConnectedChange?.(false)
  })

  ws.addEventListener('message', event => {
    try {
      const parsed = JSON.parse(String(event.data))
      onEvent(parsed as BygMessageLiveServerEvent)
    } catch {
      // ignore malformed websocket payloads
    }
  })

  return ws
}

export function sendTypingEvent(
  socket: WebSocket | null,
  toUserId: number,
  isTyping: boolean
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false
  const normalizedToUserId = Number(toUserId)
  if (!Number.isFinite(normalizedToUserId)) return false

  const payload: BygMessageLiveClientEvent = {
    type: 'typing',
    toUserId: normalizedToUserId,
    isTyping,
  }
  socket.send(JSON.stringify(payload))
  return true
}
