<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
  } from 'vue'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import VStack from '@/components/layout/VStack.vue'
  import NewPostsAvailable from '@/components/posts/NewPostAvailable.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import {
    adCache,
    getCachedCurrentUser,
    POST_CACHE_TTL,
    postCache,
    postCacheTime,
    setCachedCurrentUser,
  } from '@/data/caches'
  import { reloader } from '@/data/events.ts'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import AdView from '@/views/AdView.vue'

  const posts: Ref<BygPost[]> = ref([])
  const isLoaded: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const hasNewPosts: Ref<boolean> = ref(false)
  const userSubscriptionState: Ref<string | null> = ref(null)

  const isFreeUser = computed(() => {
    return (
      !userSubscriptionState.value || userSubscriptionState.value === 'free'
    )
  })

  let interval: number | undefined

  title.value = 'Social'
  setHeadMeta({
    page: 'Social',
    subtitle: 'Byg Social for Web.',
  })

  const loadPosts = async () => {
    try {
      // use cache if fresh
      if (
        postCache.value &&
        Date.now() - postCacheTime.value < POST_CACHE_TTL
      ) {
        posts.value = postCache.value
        hasNewPosts.value = false
        return
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/latest-posts`)
      if (!res.ok) throw new Error('Failed to load posts')

      const data = (await res.json()) as BygPost[]
      posts.value = data
      postCache.value = data
      postCacheTime.value = Date.now()
      hasNewPosts.value = false
    } catch (err) {
      error.value = 'Failed to load posts.'
    } finally {
      isLoaded.value = true
    }
  }

  const loadUserSubscription = async () => {
    if (!auth.user) return

    // Check cache first
    const cached = getCachedCurrentUser()
    if (cached) {
      userSubscriptionState.value = cached.subscriptionState ?? null
      return
    }

    try {
      const res = await api('/profile-me')
      if (res.ok) {
        const profile = await res.json()
        userSubscriptionState.value = profile.user?.subscriptionState ?? null
        setCachedCurrentUser(profile.user)
      }
    } catch (err) {
      console.error('Failed to load user subscription:', err)
    }
  }

  const reloadAndScroll = async () => {
    postCache.value = null

    await loadPosts()
    await nextTick()

    const top = document.getElementById('top')
    top?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const checkForNewPosts = async () => {
    if (!posts.value.length) return

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/latest-posts`)
      if (!res.ok) return

      const latest = (await res.json()) as BygPost[]

      if (latest[0]?.id !== posts.value[0]?.id) {
        hasNewPosts.value = true
      }
    } catch {
      // silently fail
    }
  }

  onMounted(async () => {
    await loadPosts()
    await loadUserSubscription()
    interval = window.setInterval(checkForNewPosts, 10000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  reloader.on('reload', () => {
    reloadAndScroll()
  })
</script>

<template>
  <ContentArea class="bygSocial">
    <p id="top" />
    <EmptyState v-if="!isLoaded" message="Loading posts." />

    <ErrorState v-else-if="error" :message="error" />

    <VStack v-else class="postList">
      <NewPostsAvailable v-if="hasNewPosts" @click="reloadAndScroll" />

      <VStack v-for="post in posts" :key="post.id" class="postContainer">
        <RouterLink
          class="postLink"
          :to="`/details/${post.id}`"
          custom
          v-slot="{ navigate }"
        >
          <PostItem :post="post" @navigate="navigate" />
        </RouterLink>

        <AdView
          v-if="
            isFreeUser &&
            adCache.length > 0 &&
            Math.floor(Math.random() * 5) + 1 == 1
          "
          :ad="adCache.randomElement()!"
        />
      </VStack>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .postList, .postContainer
    width: 100%
    gap: 0.5rem
</style>
