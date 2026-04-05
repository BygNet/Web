<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { useAsyncData, useHead, useRequestURL, useSeoMeta } from 'nuxt/app'
  import { computed, onUnmounted, type Ref, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { showBackButton, title } from '@/data/title'
  import { getApiBaseUrl, joinUrl } from '@/utils/runtimeConfig'

  const route = useRoute()
  const requestUrl = useRequestURL()
  const username = computed(() => route.params.username as string)

  const profile: Ref<BygProfile | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(false)

  title.value = 'Profile'
  showBackButton.value = true

  const { data, error, status } = await useAsyncData(
    () => `profile:${username.value}`,
    async () => {
      try {
        return await $fetch<BygProfile>(
          joinUrl(getApiBaseUrl(), `/profile/${username.value}`)
        )
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return null
        }

        throw err
      }
    },
    {
      watch: [ username ],
    }
  )

  const pageTitle = computed(() => {
    if (!profile.value?.user.username) return 'Profile'
    return `${profile.value.user.username} on Byg`
  })

  const pageDescription = computed(() => {
    if (!profile.value?.user) return 'View a Byg profile.'

    return (
      profile.value.user.bio?.trim() ||
      `View ${profile.value.user.username}'s Byg profile.`
    )
  })

  const canonicalUrl = computed(() => {
    return new URL(`/u/${username.value}`, requestUrl.origin).toString()
  })

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogUrl: canonicalUrl,
    ogType: 'profile',
    ogImage: computed(() => profile.value?.user.avatarUrl ?? undefined),
    twitterCard: 'summary',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: computed(() => profile.value?.user.avatarUrl ?? undefined),
    robots: computed(() =>
      error.value || !profile.value ? 'noindex, nofollow' : 'index, follow'
    ),
  })

  useHead(() => ({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl.value,
      },
    ],
  }))

  function handleFollow() {
    if (profile.value) {
      isFollowing.value = !isFollowing.value
    }
  }

  watch(
    () => data.value,
    nextProfile => {
      profile.value = nextProfile ?? null
      isFollowing.value = nextProfile?.isFollowing ?? false
      title.value = nextProfile?.user.username ?? 'Profile'
    },
    { immediate: true }
  )

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="profilePage">
    <EmptyState message="Loading profile..." v-if="status === 'pending'" />
    <ErrorState
      v-else-if="error || !profile"
      :message="profile ? 'Failed to load profile' : 'User not found'"
    />

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
