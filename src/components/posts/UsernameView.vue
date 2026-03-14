<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { type Ref, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  import HStack from '@/components/layout/HStack.vue'
  import { fetchProfileByUsername } from '@/data/profiles'
  import { StaffUsers } from '@/data/users.ts'

  const props = defineProps<{
    name: string
    verified?: boolean
    author?: boolean
    displayMode?: boolean
    following?: boolean
    avatarUrl?: string | null
    subscriptionState?: string | null
  }>()

  const router = useRouter()
  const isStaff: Ref<boolean> = ref(false)
  const subscriptionState: Ref<string | null> = ref(null)
  const avatarUrl: Ref<string | null> = ref(null)
  let activeRequestId = 0

  async function hydrateProfileMeta(): Promise<void> {
    const requestId = ++activeRequestId
    avatarUrl.value = props.avatarUrl ?? null
    subscriptionState.value = props.subscriptionState ?? null

    if (
      props.avatarUrl !== undefined ||
      props.subscriptionState !== undefined
    ) {
      return
    }

    try {
      const profile = await fetchProfileByUsername(props.name)
      if (!profile || requestId !== activeRequestId) return

      subscriptionState.value = profile.user?.subscriptionState ?? null
      avatarUrl.value = profile.user?.avatarUrl ?? null
    } catch (err) {
      console.error(`Failed to fetch subscription for ${props.name}:`, err)
    }
  }

  watch(
    () => [ props.name, props.avatarUrl, props.subscriptionState ],
    () => {
      isStaff.value = StaffUsers.includes(props.name)
      hydrateProfileMeta()
    },
    { immediate: true }
  )

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

      &.staff, &.author
        padding: 0.15rem 0.35rem
      &.verified, &.subscription
        padding: 0.35rem
      &.subscription
        background: rgba(255, 215, 0, 0.6)

      svg
        width: 1rem
        height: 1rem

    .followButton
      padding: 0.15rem 0.35rem
</style>
