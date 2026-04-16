<script setup lang="ts">
  import type { BygProfile, BygVerification } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref, watch } from 'vue'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import { getCachedProfile, setCachedProfile } from '@/data/caches'
  import { fetchProfileByUsername } from '@/data/profiles'
  import { StaffUsers } from '@/data/users'
  import { getVerificationColor } from '@/utils/verificationData'
  import { navigateTo } from '#app'
  import SafeLink from "~/components/base/SafeLink.vue";

  const localePath = useLocalePath()
  const props = defineProps<{
    name: string
    author?: boolean
    displayMode?: boolean
    minimal?: boolean
    following?: boolean
    avatarUrl?: string | null
    subscriptionState?: string | null
    hideFollowButton?: boolean
  }>()

  const isStaff: Ref<boolean> = ref(false)
  const verification: Ref<BygVerification | null> = ref(null)
  const subscriptionState: Ref<string | null> = ref(null)
  const avatarUrl: Ref<string | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(props.following ?? false)
  const isLoading: Ref<boolean> = ref(false)
  const userId: Ref<number | null> = ref(null)
  let activeRequestId = 0

  const isOwnUser = computed(() => {
    if (auth.user?.id && userId.value) {
      return auth.user.id === userId.value
    }
    if (!auth.user?.username) return false
    return (
      auth.user.username.trim().toLowerCase() === props.name.trim().toLowerCase()
    )
  })

  function applyCachedProfile(profile: {
    user?: BygProfile['user']
    isFollowing?: boolean
  }): void {
    subscriptionState.value = profile.user?.subscriptionState ?? null
    verification.value = profile.user?.verification ?? null
    avatarUrl.value = profile.user?.avatarUrl ?? null
    userId.value = profile.user?.id ?? null
    if (typeof profile.isFollowing === 'boolean') {
      isFollowing.value = profile.isFollowing
    }
  }

  async function hydrateProfileMeta(): Promise<void> {
    const requestId = ++activeRequestId
    avatarUrl.value = props.avatarUrl ?? null
    subscriptionState.value = props.subscriptionState ?? null
    isFollowing.value = props.following ?? false
    userId.value = null

    const cachedProfile = getCachedProfile(props.name)
    if (cachedProfile) {
      applyCachedProfile(cachedProfile)
    }

    try {
      const profile = (await fetchProfileByUsername(
        props.name
      )) as BygProfile | null
      if (!profile || requestId !== activeRequestId) return
      applyCachedProfile(profile)
    } catch (err) {
      console.error(`Failed to fetch subscription for ${props.name}:`, err)
    }
  }

  async function ensureUserId(): Promise<void> {
    if (userId.value) return
    try {
      const profile = (await fetchProfileByUsername(
        props.name
      )) as BygProfile | null
      if (!profile) return
      applyCachedProfile(profile)
    } catch (err) {
      console.error(`Failed to resolve profile for ${props.name}:`, err)
    }
  }

  async function handleFollow() {
    if (!auth.user) {
      await navigateTo(localePath('login'))
      return
    }
    if (isOwnUser.value) {
      console.error(`Unable to follow ${props.name}: cannot follow yourself`)
      return
    }
    await ensureUserId()
    if (!userId.value) {
      console.error(`Unable to follow ${props.name}: missing user id`)
      return
    }
    isLoading.value = true
    try {
      const res = await api(`/follow-user/${userId.value}`, {
        method: 'POST',
      })
      if (res.ok) {
        isFollowing.value = !isFollowing.value
        const cached = getCachedProfile(props.name)
        if (cached) {
          setCachedProfile(props.name, {
            user: cached.user,
            followerCount: cached.followerCount,
            followingCount: cached.followingCount,
            isFollowing: isFollowing.value,
          })
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  watch(
    () => [ props.name, props.avatarUrl, props.subscriptionState, props.following ],
    () => {
      isStaff.value = StaffUsers.includes(props.name)
      hydrateProfileMeta()
    },
    { immediate: true }
  )

  function viewProfile(): void {
    navigateTo(localePath(`/u/${props.name}`))
  }
</script>

<template>
  <HStack class="userName">
    <img
      v-if="avatarUrl && !displayMode"
      :src="avatarUrl"
      class="inlineAvatar"
      alt="Avatar"
    />
    <Component :is="displayMode ? 'h1' : 'p'">
      <span class="at" v-if="!displayMode && !avatarUrl">@</span>
      <span @click="viewProfile" class="profileLink name">
        {{ name }}
      </span>
    </Component>

    <!-- Authenticity badges -->
    <SafeLink to="/verification">
      <Icon
        v-if="verification"
        class="verificationBadge"
        :class="{ largeBadge: displayMode }"
        icon="solar:verified-check-bold"
        :style="{ color: getVerificationColor(verification) }"
      />
    </SafeLink>

    <HStack class="badges" v-if="!minimal">
      <HStack class="badge staff" v-if="isStaff">
        <Icon icon="solar:shield-check-line-duotone" />
        Staff
      </HStack>

      <HStack class="badge author" v-if="author">
        <Icon icon="carbon:user-avatar-filled" />
        Author
      </HStack>

      <HStack
        class="badge subscription"
        v-if="subscriptionState && subscriptionState !== 'free'"
      >
        <Icon icon="solar:crown-star-line-duotone" />
      </HStack>
    </HStack>

    <button
      class="followButton"
      @click="handleFollow"
      :disabled="isLoading"
      v-if="!displayMode && !hideFollowButton && !minimal && !isOwnUser"
    >
      <Icon
        :icon="
          isFollowing
            ? 'solar:check-circle-line-duotone'
            : 'solar:user-plus-line-duotone'
        "
      />
      {{ isFollowing ? 'Following' : 'Follow' }}
    </button>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .userName
    gap: 0.25rem

    .inlineAvatar
      width: 1rem
      height: 1rem
      border-radius: 50%

    .at
      opacity: 0.5

    .name
      cursor: pointer

    .profileLink
      &:hover
        text-decoration: underline
        text-decoration-color: themes.$accentColor

    .verificationBadge
      width: 1.25rem
      height: 1.25rem

      &.largeBadge
        width: 2.5rem
        height: 2.5rem

    .badges
      gap: 0.25rem

    .badge
      gap: 0
      background: themes.$accentColor

      &.staff, &.author
        padding: 0.15rem 0.35rem
      &.subscription
        padding: 0.35rem
      &.subscription
        background: rgba(255, 215, 0, 0.6)

      svg
        width: 1rem
        height: 1rem

    .followButton
      padding: 0.15rem 0.35rem
</style>
