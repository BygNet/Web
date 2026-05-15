import { type Ref, ref } from 'vue'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import type { BygAsk } from '@/types/asks'

const DEFAULT_ASKS_LIMIT = 50
const ASK_CACHE_TTL = 30 * 1000

export const asksCache: Ref<BygAsk[] | null> = ref(null)
export const asksCacheTime: Ref<number> = ref(0)

let asksRequest: Promise<BygAsk[]> | null = null

export function clearAsksState(): void {
  asksCache.value = null
  asksCacheTime.value = 0
  asksRequest = null
}

export async function fetchCurrentUserAsks(
  options: { force?: boolean } = {}
): Promise<BygAsk[]> {
  if (!auth.user || !auth.token) {
    clearAsksState()
    return []
  }

  if (
    !options.force &&
    asksCache.value &&
    Date.now() - asksCacheTime.value < ASK_CACHE_TTL
  ) {
    return asksCache.value
  }

  if (!options.force && asksRequest) {
    return asksRequest
  }

  async function loadAsks(): Promise<BygAsk[]> {
    const response = await api(`/asks?limit=${DEFAULT_ASKS_LIMIT}`)
    if (!response.ok) {
      throw new Error('Failed to load asks')
    }

    const asks = (await response.json()) as BygAsk[]
    asksCache.value = asks
    asksCacheTime.value = Date.now()
    return asks
  }

  asksRequest = loadAsks().finally(() => {
    asksRequest = null
  })

  return asksRequest
}
