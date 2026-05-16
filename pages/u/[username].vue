<script setup lang="ts">
  import type { BygPost, BygProfile } from '@bygnet/types'
  import { computed, type Ref, ref, watch } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import ProfileView from '@/components/profile/ProfileView.vue'
  import { fetchProfileByUsername } from '@/data/profiles'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'
  import { useLazyAsyncData, useRoute } from '#app'
  import SafeLink from '~/components/base/SafeLink.vue'
  import VStack from '~/components/layout/VStack.vue'
  import PostItem from '~/components/posts/PostItem.vue'

  definePageMeta({ showBackButton: true })

  const route = useRoute()
  const config = useRuntimeConfig()
  const usernameParam = (route.params.username as string) || null
  const username = computed(() => usernameParam)

  const profile: Ref<BygProfile | null> = ref(null)
  const isLoading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const isFollowing: Ref<boolean> = ref(false)
  const pageSubtitle: Ref<string> = ref('Loading...')
  const userPosts: Ref<BygPost[]> = ref([])

  // Set initial head meta
  title.value = 'Profile'
  setHeadMeta({ page: title.value, subtitle: pageSubtitle.value })

  async function loadProfile() {
    if (!username.value) {
      error.value = 'Invalid username'
      isLoading.value = false
      return
    }

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
      const [ { data: posts } ] = await Promise.all([
        useLazyAsyncData(`posts-${username.value}`, () =>
          $fetch<BygPost[]>(`${config.public.apiBase}/posts/${username.value}`)
        ),
      ])

      userPosts.value = posts.value ?? []
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

    <VStack class="postList">
      <VStack
        v-for="post in userPosts"
        :key="post.id"
        class="postContainer fullWidth"
      >
        <SafeLink
          class="postLink fullWidth"
          :to="`/details/${post.id}`"
          custom
          v-slot="{ navigate }"
        >
          <PostItem class="fullWidth" :post="post" @navigate="navigate" />
        </SafeLink>
      </VStack>
    </VStack>
  </ContentArea>
</template>
