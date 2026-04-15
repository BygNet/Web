import type { BygProfile } from '@bygnet/types'

import { api } from '@/api/client'
import { auth } from '@/auth/session'
import {
  getCachedCurrentUser,
  getCachedProfile,
  setCachedCurrentUser,
  setCachedProfile,
  setCachedSubscriptionState,
} from '@/data/caches'

const profileRequestCache = new Map<string, Promise<BygProfile | null>>()
let currentUserProfileRequest: Promise<BygProfile | null> | null = null

function profileCacheKey(username: string): string {
  return username.trim().toLowerCase()
}

function toProfile(
  cached: NonNullable<ReturnType<typeof getCachedProfile>>
): BygProfile {
  return {
    user: cached.user,
    followerCount: cached.followerCount,
    followingCount: cached.followingCount,
    isFollowing: cached.isFollowing,
  }
}

function cacheProfile(profile: BygProfile): void {
  const username = profile.user?.username
  if (!username) return

  setCachedProfile(username, {
    user: profile.user,
    followerCount: profile.followerCount ?? 0,
    followingCount: profile.followingCount ?? 0,
    isFollowing: profile.isFollowing,
  })
  setCachedSubscriptionState(username, profile.user?.subscriptionState ?? null)
}

export async function fetchProfileByUsername(
  username: string,
  options: { force?: boolean } = {}
): Promise<BygProfile | null> {
  const normalizedUsername = username.trim()
  if (!normalizedUsername) return null

  if (!options.force) {
    const cached = getCachedProfile(normalizedUsername)
    if (cached) {
      return toProfile(cached)
    }

    const pending = profileRequestCache.get(profileCacheKey(normalizedUsername))
    if (pending) {
      return pending
    }
  }

  async function loadProfile(): Promise<BygProfile | null> {
    const res = await api(`/profile/${normalizedUsername}`)
    if (!res.ok) return null

    const profile = (await res.json()) as BygProfile
    cacheProfile(profile)
    return profile
  }

  const request = loadProfile().finally(() => {
    profileRequestCache.delete(profileCacheKey(normalizedUsername))
  })

  profileRequestCache.set(profileCacheKey(normalizedUsername), request)
  return request
}

export async function fetchCurrentUserProfile(
  options: { force?: boolean } = {}
): Promise<BygProfile | null> {
  if (!auth.user) {
    return null
  }

  if (!options.force) {
    const cachedUser = getCachedCurrentUser({
      requireSubscriptionState: true,
    })
    if (cachedUser?.username) {
      const cachedProfile = getCachedProfile(cachedUser.username)
      if (cachedProfile) {
        return toProfile(cachedProfile)
      }
    }

    if (currentUserProfileRequest) {
      return currentUserProfileRequest
    }
  }

  async function loadCurrentUserProfile(): Promise<BygProfile | null> {
    const res = await api('/profile-me')
    if (!res.ok) return null

    const profile = (await res.json()) as BygProfile
    setCachedCurrentUser(profile.user)
    cacheProfile(profile)
    return profile
  }

  currentUserProfileRequest = loadCurrentUserProfile().finally(() => {
    currentUserProfileRequest = null
  })

  return currentUserProfileRequest
}

export function clearProfileRequestState(): void {
  profileRequestCache.clear()
  currentUserProfileRequest = null
}
