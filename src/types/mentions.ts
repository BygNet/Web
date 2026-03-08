import type { BygSubscription } from '@bygnet/types'

export interface BygUserSuggestion {
  id: number
  username: string
  avatarUrl: string | null
  subscriptionState: BygSubscription
}

