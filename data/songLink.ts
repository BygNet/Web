import type { BygSongLinkInfo } from '@bygnet/types'

import { api } from '@/api/client'

const infoCache = new Map<string, BygSongLinkInfo | null>()
const requestCache = new Map<string, Promise<BygSongLinkInfo | null>>()

function normalizeUrl(url: string): string {
  return url.trim()
}

export async function fetchSongLinkInfo(
  url: string,
  options: { force?: boolean } = {}
): Promise<BygSongLinkInfo | null> {
  const normalizedUrl = normalizeUrl(url)
  if (!normalizedUrl) return null

  if (!options.force) {
    if (infoCache.has(normalizedUrl)) {
      return infoCache.get(normalizedUrl) ?? null
    }

    const pending = requestCache.get(normalizedUrl)
    if (pending) {
      return pending
    }
  }

  async function loadInfo(): Promise<BygSongLinkInfo | null> {
    const res = await api(
      `/song-link-info?url=${encodeURIComponent(normalizedUrl)}`
    )
    if (!res.ok) {
      infoCache.set(normalizedUrl, null)
      return null
    }

    const info = (await res.json()) as BygSongLinkInfo
    infoCache.set(normalizedUrl, info)
    return info
  }

  const request = loadInfo().finally(() => {
    requestCache.delete(normalizedUrl)
  })

  requestCache.set(normalizedUrl, request)
  return request
}
