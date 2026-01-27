<script setup lang="ts">
  import { nextTick, onMounted, onUnmounted, type Ref, ref } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import VStack from '@/components/layout/VStack.vue'
  import NewPostsAvailable from '@/components/posts/NewPostAvailable.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { postCache, postCacheTime } from '@/data/caches'
  import { reloader } from '@/data/events.ts'
  import { title } from '@/data/title.ts'
  import type { BygPost } from '@/types/contentTypes.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  const posts: Ref<BygPost[]> = ref([])
  const isLoaded: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const hasNewPosts: Ref<boolean> = ref(false)
  const CACHE_TTL = 30_000

  let interval: number | undefined

  title.value = 'Social'
  setHeadMeta({
    page: 'Social',
    subtitle: 'Byg Social for Web.',
  })

  const loadPosts = async () => {
    try {
      // use cache if fresh
      if (postCache.value && Date.now() - postCacheTime.value < CACHE_TTL) {
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

      <RouterLink
        class="postLink"
        v-for="post in posts"
        :to="`/details/${post.id}`"
        :key="post.id"
        custom
        v-slot="{ navigate }"
      >
        <PostItem :post="post" @navigate="navigate" />
      </RouterLink>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .postList
    width: 100%
    gap: 0.5rem
</style>
