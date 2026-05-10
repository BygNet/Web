<script setup lang="ts">
  import type { BygProfile, BygUser } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { type Ref, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import { getCachedProfile, setCachedProfile } from '@/data/caches'
  import { fetchProfileByUsername } from '@/data/profiles'
  import { StaffUsers } from '@/data/users'
  import { getVerificationColor } from '@/utils/verificationData'
  import { navigateTo } from '#app'
  import VStack from '~/components/layout/VStack.vue'

  const localePath = useLocalePath()
  const { t } = useI18n()
  const props = defineProps<{
    name: string
    author?: boolean
    displayMode?: boolean
    minimal?: boolean
    hideFollowButton?: boolean
    noLink?: boolean
  }>()

  const isStaff: Ref<boolean> = ref(false)
  const user: Ref<BygUser | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(false)
  const isLoading: Ref<boolean> = ref(false)
  let activeRequestId = 0

  function isOwnUser(): boolean {
    if (auth.user?.id && user.value?.id) {
      return auth.user.id === user.value.id
    }

    if (!auth.user?.username) return false

    return (
      auth.user.username.trim().toLowerCase() ===
      props.name.trim().toLowerCase()
    )
  }

  function applyProfile(profile: {
    user?: BygUser
    isFollowing?: boolean
  }): void {
    user.value = profile.user ?? null

    if (typeof profile.isFollowing === 'boolean') {
      isFollowing.value = profile.isFollowing
    }
  }

  async function hydrateProfileMeta(): Promise<void> {
    const requestId = ++activeRequestId

    user.value = null
    isFollowing.value = false

    const cachedProfile = getCachedProfile(props.name)
    if (cachedProfile) {
      applyProfile(cachedProfile)
    }

    try {
      const profile = (await fetchProfileByUsername(
        props.name
      )) as BygProfile | null

      if (!profile || requestId !== activeRequestId) return

      applyProfile(profile)
    } catch (err) {
      console.error(`Failed to fetch profile for ${props.name}:`, err)
    }
  }

  async function ensureUser(): Promise<void> {
    if (user.value?.id) return

    try {
      const profile = (await fetchProfileByUsername(
        props.name
      )) as BygProfile | null

      if (!profile) return

      applyProfile(profile)
    } catch (err) {
      console.error(`Failed to resolve profile for ${props.name}:`, err)
    }
  }

  async function handleFollow() {
    if (!auth.user) {
      await navigateTo(localePath('login'))
      return
    }
    if (isOwnUser()) {
      console.error(`Unable to follow ${props.name}: cannot follow yourself`)
      return
    }
    await ensureUser()
    if (!user.value?.id) {
      console.error(`Unable to follow ${props.name}: missing user id`)
      return
    }
    isLoading.value = true
    try {
      const res = await api(`/follow-user/${user.value.id}`, {
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
    () => [ props.name ],
    () => {
      isStaff.value = StaffUsers.includes(props.name)
      hydrateProfileMeta()
    },
    { immediate: true }
  )

  function viewProfile(): void {
    if (props.displayMode || props.noLink) return
    navigateTo(localePath(`/u/${props.name}`))
  }
</script>

<template>
  <VStack class="noSpace">
    <HStack class="userName">
      <img
        v-if="user?.avatarUrl && !displayMode"
        :src="user.avatarUrl"
        class="inlineAvatar"
        alt="Avatar"
      />
      <Component :is="displayMode ? 'h1' : 'p'">
        <span class="at" v-if="!displayMode && !user?.avatarUrl">@</span>
        <span
          @click="viewProfile"
          class="profileLink name"
          :class="{ displayMode, noLink }"
        >
          {{ displayMode && user?.displayName ? user.displayName : name }}
        </span>
      </Component>

      <!-- Authenticity badges -->
      <SafeLink to="/verification">
        <Icon
          v-if="user?.verification"
          class="verificationBadge"
          :class="{ largeBadge: displayMode }"
          icon="solar:verified-check-bold"
          :style="{ color: getVerificationColor(user.verification) }"
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
          v-if="user?.subscriptionState && user.subscriptionState !== 'free'"
        >
          <Icon icon="solar:crown-star-line-duotone" />
        </HStack>
      </HStack>

      <button
        class="followButton"
        @click="handleFollow"
        :disabled="isLoading"
        v-if="!displayMode && !hideFollowButton && !minimal && !isOwnUser()"
      >
        <Icon
          :icon="
            isFollowing
              ? 'solar:check-circle-line-duotone'
              : 'solar:user-plus-line-duotone'
          "
        />
        {{ isFollowing ? t('ui.profile.following') : t('ui.profile.follow') }}
      </button>
    </HStack>

    <h3 class="usernameFallback" v-if="displayMode && user?.displayName">
      {{ name }}
    </h3>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .usernameFallback
    opacity: 0.6
    margin: 0

  .userName
    gap: 0.25rem

    .inlineAvatar
      width: 1rem
      height: 1rem
      border-radius: 50%

    .at
      opacity: 0.5

    h1
      margin: 0

    .profileLink:not(.displayMode):not(.noLink)
      cursor: pointer

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
