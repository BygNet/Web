import type { BygAd, BygImage, BygPost, BygUser } from '@bygnet/types'
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
  user: BygUser
  followerCount: number
  followingCount: number
  isFollowing?: boolean
  timestamp: number
}

type ProfileCacheInput = Omit<ProfileCache, 'timestamp'>

interface UserProfileCache {
  [username: string]: ProfileCache
}

type CachedCurrentUser = Pick<BygUser, 'id' | 'email' | 'username'> &
  Partial<BygUser>

interface SubscriptionCache {
  state: string | null
  timestamp: number
}

function cacheKey(username: string): string {
  return username.trim().toLowerCase()
}

// Current user data cache (very long TTL - 1 hour)
export const currentUserCache: Ref<CachedCurrentUser | null> = ref(null)
export const currentUserCacheTime: Ref<number> = ref(0)
export const CURRENT_USER_CACHE_TTL = 60 * 60 * 1000 // 1 hour

// Profile data cache for other users (medium TTL - 30 minutes)
export const profileCache: Ref<UserProfileCache> = ref({})
export const PROFILE_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Username to subscription state cache for badges (long TTL - 24 hours)
export const subscriptionStateCache: Ref<{
  [username: string]: SubscriptionCache
}> = ref({})
export const SUBSCRIPTION_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export function getCachedCurrentUser(
  options: {
    requireSubscriptionState?: boolean
  } = {}
): CachedCurrentUser | null {
  if (!currentUserCache.value) return null
  if (Date.now() - currentUserCacheTime.value > CURRENT_USER_CACHE_TTL) {
    currentUserCache.value = null
    return null
  }

  if (
    options.requireSubscriptionState &&
    typeof currentUserCache.value.subscriptionState !== 'string'
  ) {
    return null
  }

  return currentUserCache.value
}

export function setCachedCurrentUser(user: CachedCurrentUser): void {
  currentUserCache.value = user
  currentUserCacheTime.value = Date.now()
}

export function getCachedProfile(username: string): ProfileCache | null {
  const key = cacheKey(username)
  const cached = profileCache.value[key]
  if (!cached) return null
  if (Date.now() - cached.timestamp > PROFILE_CACHE_TTL) {
    delete profileCache.value[key]
    return null
  }
  return cached
}

export function setCachedProfile(
  username: string,
  profile: ProfileCacheInput
): void {
  profileCache.value[cacheKey(username)] = {
    ...profile,
    timestamp: Date.now(),
  }
}

export function getCachedSubscriptionState(username: string): string | null {
  const key = cacheKey(username)
  const cached = subscriptionStateCache.value[key]
  if (!cached) return null
  if (Date.now() - cached.timestamp > SUBSCRIPTION_CACHE_TTL) {
    delete subscriptionStateCache.value[key]
    return null
  }
  return cached.state
}

export function setCachedSubscriptionState(
  username: string,
  state: string | null
): void {
  subscriptionStateCache.value[cacheKey(username)] = {
    state,
    timestamp: Date.now(),
  }
}

export function clearUserCaches(): void {
  currentUserCache.value = null
  currentUserCacheTime.value = 0
  profileCache.value = {}
  subscriptionStateCache.value = {}
}
