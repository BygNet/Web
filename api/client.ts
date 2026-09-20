import ky, { type Options } from 'ky'

import { auth, clearActiveSession } from '@/auth/session'
import { clearUserCaches } from '@/data/caches'
import { useEnv } from '@/utils/env'

const RESPONSE_CACHE = 'byg-api-responses-v1'
const OFFLINE_QUEUE_KEY = 'byg:offline-requests:v1'

export type BygRequestOptions = Options & {
  offlineQueue?: boolean
  authToken?: string | null
}

interface QueuedRequest {
  path: string
  method: string
  body?: string
  headers?: Record<string, string>
}

function normalizedPath(path: string): string {
  return path.replace(/^\/+/, '')
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage
}

function readQueue(): QueuedRequest[] {
  if (!canUseStorage()) return []
  try {
    const value = JSON.parse(
      localStorage.getItem(OFFLINE_QUEUE_KEY) ?? '[]'
    ) as unknown
    return Array.isArray(value) ? (value as QueuedRequest[]) : []
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedRequest[]): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(-50)))
  } catch {
    // Storage is an enhancement, not a requirement for requests.
  }
}

function queueRequest(path: string, options: BygRequestOptions): void {
  const headers = new Headers()
  for (const [ key, value ] of Object.entries(options.headers ?? {})) {
    if (typeof value === 'string') headers.set(key, value)
  }
  headers.delete('Authorization')
  writeQueue([
    ...readQueue(),
    {
      path,
      method: options.method ?? 'GET',
      body:
        typeof options.body === 'string'
          ? options.body
          : options.json === undefined
            ? undefined
            : JSON.stringify(options.json),
      headers: Object.fromEntries(headers.entries()),
    },
  ])
}

function buildClient(authToken?: string | null) {
  const { apiBase } = useEnv()

  return ky.create({
    prefixUrl: String(apiBase).replace(/\/+$/, ''),
    retry: 0,
    timeout: 12_000,
    throwHttpErrors: false,
    hooks: {
      beforeRequest: [
        request => {
          const token = authToken ?? auth.token
          if (!request.headers.has('Authorization') && token) {
            request.headers.set('Authorization', `Bearer ${token}`)
          }
          if (
            !request.headers.has('Content-Type') &&
            request.method !== 'GET'
          ) {
            request.headers.set('Content-Type', 'application/json')
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          if (response.status === 401) {
            clearActiveSession()
            clearUserCaches()
          }

          if (response.ok && response.url && typeof caches !== 'undefined') {
            try {
              const cache = await caches.open(RESPONSE_CACHE)
              await cache.put(response.url, response.clone())
            } catch {
              // Cache API is unavailable in some embedded browsers.
            }
          }

          return response
        },
      ],
    },
  })
}

async function getCachedResponse(path: string): Promise<Response | null> {
  if (typeof caches === 'undefined') return null
  try {
    const { apiBase } = useEnv()
    const cache = await caches.open(RESPONSE_CACHE)
    return (
      (await cache.match(
        `${String(apiBase).replace(/\/+$/, '')}/${normalizedPath(path)}`
      )) ?? null
    )
  } catch {
    return null
  }
}

export async function api(
  path: string,
  options: BygRequestOptions = {}
): Promise<Response> {
  const { offlineQueue = false, authToken, ...requestOptions } = options
  const method = String(requestOptions.method ?? 'GET').toUpperCase()
  const client = buildClient(authToken)

  try {
    return await client(normalizedPath(path), requestOptions)
  } catch (error) {
    if (method === 'GET') {
      const cached = await getCachedResponse(path)
      if (cached) return cached
    }

    if (offlineQueue && method !== 'GET') {
      queueRequest(path, { ...options, method })
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw error
  }
}

export async function flushOfflineRequests(): Promise<void> {
  const queue = readQueue()
  if (!queue.length) return

  const remaining: QueuedRequest[] = []
  for (const queued of queue) {
    try {
      const response = await api(queued.path, {
        method: queued.method,
        body: queued.body,
        headers: queued.headers,
        offlineQueue: false,
      })
      if (!response.ok) remaining.push(queued)
    } catch {
      remaining.push(queued)
    }
  }
  writeQueue(remaining)
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineRequests().catch(() => undefined)
  })
}
