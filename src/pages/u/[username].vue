<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { computed, onUnmounted, type Ref, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { fetchProfileByUsername } from '@/data/profiles'
  import { showBackButton, title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  const route = useRoute()
  const username = computed(() => route.params.username as string)

  const profile: Ref<BygProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(false)
  const pageSubtitle: Ref<string> = ref('Loading...')

  // Set initial head meta
  title.value = 'Profile'
  showBackButton.value = true
  setHeadMeta({ page: title.value, subtitle: pageSubtitle.value })

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

      title.value = profile.value?.user.username ?? 'Profile'
      pageSubtitle.value = profile.value?.user.bio ?? 'No bio'
    } catch (err) {
      error.value = 'Failed to load profile'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  function handleFollow() {
    if (profile.value) {
      isFollowing.value = !isFollowing.value
    }
  }

  watch(
    () => username.value,
    () => {
      loadProfile()
    },
    { immediate: true }
  )

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="profilePage">
    <EmptyState message="Loading profile..." v-if="isLoading" />
    <ErrorState v-else-if="error" :message="error" />

    <ProfileView
      v-else-if="profile"
      :user="profile.user"
      :is-own-profile="false"
      :is-following="isFollowing"
      :follower-count="profile.followerCount"
      :following-count="profile.followingCount"
      @follow="handleFollow"
    />
  </ContentArea>
</template>
