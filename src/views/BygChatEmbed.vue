<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref } from 'vue'
  import { useRoute } from 'vue-router'

  import EmbedShell from '@/components/embeds/EmbedShell.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { fetchProfileByUsername } from '@/data/profiles.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  const route = useRoute()

  setHeadMeta({
    page: 'Chat Embed',
    subtitle: 'Open chat with Byg with your user.',
  })

  const profile: Ref<BygProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(false)
  const username = computed(() => route.params.id as string)

  async function loadProfile() {
    isLoading.value = true
    error.value = null

    try {
      profile.value = await fetchProfileByUsername(username.value)
      if (!profile.value) {
        error.value = 'User not found'
        return
      }
      isFollowing.value = profile.value?.isFollowing ?? false
    } catch (err) {
      error.value = 'Failed to load profile'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  loadProfile()
</script>

<template>
  <EmbedShell title="Byg Chat" class="bygChatEmbed">
    <VStack v-if="profile" class="fullWidth profile">
      <HStack class="fullWidth">
        <img
          v-if="profile.user.avatarUrl"
          :src="profile.user.avatarUrl"
          alt="avatar"
          class="userAvatar"
        />
        <Icon
          icon="solar:user-rounded-line-duotone"
          class="userAvatar"
          v-else
        />

        <VStack class="userMeta">
          <h3>{{ profile.user.username }}</h3>
          <p class="light">Message me on Byg Chat.</p>
        </VStack>
      </HStack>

      <p>{{ profile.user.bio }}</p>

      <HStack class="fullWidth actions">
        <a :href="'/messages?with=' + profile.user.username" target="_top">
          <button class="prominent">
            <Icon icon="solar:chat-round-like-line-duotone" />
            Message
          </button>
        </a>

        <a :href="'/u/' + profile.user.username" target="_top">
          <button>
            <Icon icon="solar:user-rounded-line-duotone" />
            Profile
          </button>
        </a>
      </HStack>
    </VStack>

    <ErrorState message="User not found." v-else-if="error" />

    <EmptyState message="Loading..." v-else-if="isLoading" />
  </EmbedShell>
</template>

<style scoped lang="sass">
  .bygChatEmbed
    width: 100%
    justify-content: space-between

    .profile
      min-height: 100%
      flex-wrap: nowrap
      justify-content: space-between

    .userAvatar
      width: 3rem
      height: 3rem
      border-radius: 50%
      object-fit: cover

    .userMeta
      gap: 0

      *
        margin: 0

    .actions
      a
        flex-grow: 1

      button
        width: 100%
</style>
