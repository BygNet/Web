import { api } from '@/api/client'
import type { BygUserSuggestion } from '@/types/mentions'

const DEFAULT_SUGGESTION_LIMIT = 8

export async function fetchUserSuggestions(
  query: string,
  limit = DEFAULT_SUGGESTION_LIMIT
): Promise<BygUserSuggestion[]> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return []
  }

  const normalizedLimit = Math.max(1, Math.min(limit, 12))

  const res = await api(
    `/user-suggestions?q=${encodeURIComponent(
      normalizedQuery
    )}&limit=${normalizedLimit}`
  )

  if (!res.ok) {
    return []
  }

  return (await res.json()) as BygUserSuggestion[]
}
