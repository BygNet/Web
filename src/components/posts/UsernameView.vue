<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { api } from '@/api/client'
  import HStack from '@/components/layout/HStack.vue'
  import {
    getCachedProfile,
    getCachedSubscriptionState,
    setCachedProfile,
    setCachedSubscriptionState,
  } from '@/data/caches'
  import { StaffUsers } from '@/data/users.ts'
  import { capitalize } from '@/utils/formatters.ts'

  const props = defineProps<{
    name: string
    verified?: boolean
    author?: boolean
    displayMode?: boolean
    following?: boolean
  }>()

  const router = useRouter()
  const isStaff: Ref<boolean> = ref(false)
  const subscriptionState: Ref<string | null> = ref(null)
  const avatarUrl: Ref<string | null> = ref(null)

  async function fetchSubscriptionStatus() {
    // Check profile cache first (has user data + subscription)
    const cachedProfile = getCachedProfile(props.name)
    if (cachedProfile) {
      avatarUrl.value = cachedProfile.user?.avatarUrl ?? null
      subscriptionState.value = cachedProfile.user?.subscriptionState ?? null
      return
    }

    // Check subscription cache as fallback
    const cachedSub = getCachedSubscriptionState(props.name)
    if (cachedSub !== undefined) {
      subscriptionState.value = cachedSub
      return
    }

    try {
      const res = await api(`/profile/${props.name}`)
      if (res.ok) {
        const data = await res.json()
        subscriptionState.value = data.user?.subscriptionState ?? null
        avatarUrl.value = data.user?.avatarUrl ?? null

        // Cache the subscription state and profile
        setCachedSubscriptionState(props.name, subscriptionState.value)
        setCachedProfile(props.name, {
          user: data.user,
          followerCount: data.followerCount,
          followingCount: data.followingCount,
        })
      }
    } catch (err) {
      console.error(`Failed to fetch subscription for ${props.name}:`, err)
    }
  }

  onMounted(() => {
    isStaff.value = StaffUsers.includes(props.name)
    fetchSubscriptionStatus()
  })

  function viewProfile() {
    router.push({ name: 'userProfile', params: { username: props.name } })
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
    <HStack class="badge staff" v-if="isStaff">
      <Icon icon="solar:shield-check-line-duotone" />
      Staff
    </HStack>

    <HStack class="badge verified" v-if="verified">
      <Icon icon="solar:verified-check-line-duotone" />
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
      {{ capitalize(subscriptionState).replace('_legacy', '') }}
    </HStack>

    <button class="followButton" @click="viewProfile" v-if="!displayMode">
      <Icon icon="solar:user-check-line-duotone" />
      {{ following ? 'Following' : 'Follow' }}
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

    .badge
      gap: 0
      background: themes.$accentColor

      &.staff, &.author, &.subscription
        padding: 0.15rem 0.35rem
      &.verified
        padding: 0.35rem
      &.subscription
        background: rgba(255, 215, 0, 0.6)

      svg
        width: 1rem
        height: 1rem

    .followButton
      padding: 0.15rem 0.35rem
</style>
