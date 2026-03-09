import { api } from '@/api/client'
import { auth } from '@/auth/session'
import type {
  BygMessage,
  BygMessageConversation,
  BygMessageLiveClientEvent,
  BygMessageLiveServerEvent,
  BygMessageSendRequest,
  BygMessageShareTarget,
  BygMessageThread,
} from '@/types/messages'

const THREAD_CACHE_TTL_MS = 20 * 1000
const CONVERSATION_CACHE_TTL_MS = 15 * 1000
const SHARE_TARGET_CACHE_TTL_MS = 30 * 1000

let threadsCache: {
  value: BygMessageThread[]
  timestamp: number
} | null = null
let shareTargetsCache: {
  value: BygMessageShareTarget[]
  timestamp: number
} | null = null
const conversationCache = new Map<
  string,
  {
    value: BygMessageConversation
    timestamp: number
  }
>()

let threadRequest: Promise<BygMessageThread[]> | null = null
let shareTargetRequest: Promise<BygMessageShareTarget[]> | null = null
const conversationRequests = new Map<
  string,
  Promise<BygMessageConversation | null>
>()

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

function buildMessagesSocketUrl(): string {
  const apiBase = String(import.meta.env.VITE_API_BASE).replace(/\/+$/, '')

  if (apiBase.startsWith('https://')) {
    return `${apiBase.replace('https://', 'wss://')}/messages/live`
  }

  if (apiBase.startsWith('http://')) {
    return `${apiBase.replace('http://', 'ws://')}/messages/live`
  }

  return `${apiBase}/messages/live`
}

export function clearMessagesState(): void {
  threadsCache = null
  shareTargetsCache = null
  conversationCache.clear()
  threadRequest = null
  shareTargetRequest = null
  conversationRequests.clear()
}

export async function fetchMessageThreads(
  options: { force?: boolean } = {}
): Promise<BygMessageThread[]> {
  if (!auth.user || !auth.token) {
    clearMessagesState()
    return []
  }

  if (
    !options.force &&
    threadsCache &&
    Date.now() - threadsCache.timestamp < THREAD_CACHE_TTL_MS
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

    const threads = (await res.json()) as BygMessageThread[]
    threadsCache = {
      value: threads,
      timestamp: Date.now(),
    }

    return threads
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

  const normalizedUsername = normalizeUsername(username)
  if (!normalizedUsername) {
    return null
  }

  const cachedConversation = conversationCache.get(normalizedUsername)
  if (
    !options.force &&
    cachedConversation &&
    Date.now() - cachedConversation.timestamp < CONVERSATION_CACHE_TTL_MS
  ) {
    return cachedConversation.value
  }

  if (!options.force && conversationRequests.has(normalizedUsername)) {
    return conversationRequests.get(normalizedUsername) ?? null
  }

  async function loadConversation(): Promise<BygMessageConversation | null> {
    const res = await api(
      `/messages/conversation/${encodeURIComponent(
        normalizedUsername
      )}?limit=200`
    )
    if (!res.ok) {
      return null
    }

    const conversation = (await res.json()) as BygMessageConversation
    conversationCache.set(normalizedUsername, {
      value: conversation,
      timestamp: Date.now(),
    })

    return conversation
  }

  const request = loadConversation().finally(() => {
    conversationRequests.delete(normalizedUsername)
  })
  conversationRequests.set(normalizedUsername, request)
  return request
}

export async function fetchMessageShareTargets(
  options: { force?: boolean } = {}
): Promise<BygMessageShareTarget[]> {
  if (!auth.user || !auth.token) {
    return []
  }

  if (
    !options.force &&
    shareTargetsCache &&
    Date.now() - shareTargetsCache.timestamp < SHARE_TARGET_CACHE_TTL_MS
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

    const targets = (await res.json()) as BygMessageShareTarget[]
    shareTargetsCache = {
      value: targets,
      timestamp: Date.now(),
    }

    return targets
  }

  shareTargetRequest = loadShareTargets().finally(() => {
    shareTargetRequest = null
  })

  return shareTargetRequest
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

  threadsCache = null
  shareTargetsCache = null

  const senderConversationKey = normalizeUsername(message.senderUsername)
  const recipientConversationKey = normalizeUsername(message.recipientUsername)

  for (const key of [ senderConversationKey, recipientConversationKey ]) {
    const existingConversation = conversationCache.get(key)
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
    onConnectedChange?.(true)

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
): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) return

  const payload: BygMessageLiveClientEvent = {
    type: 'typing',
    toUserId,
    isTyping,
  }
  socket.send(JSON.stringify(payload))
}
