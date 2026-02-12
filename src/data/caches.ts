import type { BygAd, BygImage, BygPost } from '@bygnet/types'
import { type Ref, ref } from 'vue'

// Posts Cache - Heavy caching with 5-minute TTL
export const postCache: Ref<BygPost[] | null> = ref(null)
export const postCacheTime: Ref<number> = ref(0)
export const POST_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const imageCache: Ref<BygImage[] | null> = ref(null)
export const imageCacheTime: Ref<number> = ref(0)
export const IMAGE_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export const adCache: Ref<BygAd[]> = ref([])

// Profile Caches - Heavy caching for fast access
interface ProfileCache {
  user: any
  followerCount: number
  followingCount: number
  timestamp: number
}

type ProfileCacheInput = Omit<ProfileCache, 'timestamp'>

interface UserProfileCache {
  [username: string]: ProfileCache
}

// Current user data cache (very long TTL - 1 hour)
export const currentUserCache: Ref = ref(null)
export const currentUserCacheTime: Ref<number> = ref(0)
export const CURRENT_USER_CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Profile data cache for other users (medium TTL - 30 minutes)
export const profileCache: Ref<UserProfileCache> = ref({})
export const PROFILE_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Username to subscription state cache for badges (long TTL - 24 hours)
export const subscriptionStateCache: Ref<{
  [username: string]: string | null
}> = ref({})
export const SUBSCRIPTION_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export function getCachedCurrentUser() {
  if (!currentUserCache.value) return null
  if (Date.now() - currentUserCacheTime.value > CURRENT_USER_CACHE_TTL) {
    currentUserCache.value = null
    return null
  }
  return currentUserCache.value
}

export function setCachedCurrentUser(user: any): void {
  currentUserCache.value = user
  currentUserCacheTime.value = Date.now()
}

export function getCachedProfile(username: string) {
  const cached = profileCache.value[username]
  if (!cached) return null
  if (Date.now() - cached.timestamp > PROFILE_CACHE_TTL) {
    delete profileCache.value[username]
    return null
  }
  return cached
}

export function setCachedProfile(
  username: string,
  profile: ProfileCacheInput
): void {
  profileCache.value[username] = {
    ...profile,
    timestamp: Date.now(),
  }
}

export function getCachedSubscriptionState(username: string) {
  return subscriptionStateCache.value[username] ?? null
}

export function setCachedSubscriptionState(
  username: string,
  state: string | null
): void {
  subscriptionStateCache.value[username] = state
}

export function clearUserCaches(): void {
  currentUserCache.value = null
  currentUserCacheTime.value = 0
  profileCache.value = {}
  subscriptionStateCache.value = {}
}
