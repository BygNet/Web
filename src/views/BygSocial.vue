<script setup lang="ts">
  import VStack from '@/components/layout/VStack.vue'
  import { onMounted, onUnmounted, ref, nextTick, type Ref } from 'vue'
  import type { BygPost } from '@/types/contentTypes.ts'
  import PostItem from '@/components/posts/PostItem.vue'
  import NewPostsAvailable from '@/components/posts/NewPostAvailable.vue'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import EmptyState from '@/components/layout/EmptyState.vue'

  const posts: Ref<BygPost[]> = ref([])
  const isLoaded: Ref<boolean> = ref(false)
  const hasNewPosts: Ref<boolean> = ref(false)

  let interval: number | undefined

  setHeadMeta({
    page: 'Social',
    subtitle: 'Byg Social for Web.',
  })

  const loadPosts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/latest-posts`)
    posts.value = (await res.json()) as BygPost[]
    isLoaded.value = true
    hasNewPosts.value = false
  }

  const reloadAndScroll = async () => {
    await loadPosts()
    await nextTick()

    const top = document.getElementById('top')
    top?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const checkForNewPosts = async () => {
    if (!posts.value.length) return
    console.log('checking for new posts...')

    const res = await fetch(`${import.meta.env.VITE_API_BASE}/latest-posts`)
    const latest = (await res.json()) as BygPost[]

    if (latest[0]?.id !== posts.value[0]?.id) {
      hasNewPosts.value = true
    }
  }

  onMounted(async () => {
    await loadPosts()
    interval = window.setInterval(checkForNewPosts, 10000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })
</script>

<template>
  <div class="bygSocial">
    <p id="top" />
    <EmptyState v-if="!isLoaded" message="Loading posts." />

    <VStack v-else class="postList">
      <NewPostsAvailable v-if="hasNewPosts" @click="reloadAndScroll" />

      <RouterLink
        class="postLink"
        v-for="post in posts"
        :key="post.id"
        :to="`/details/${post.id}`"
      >
        <PostItem :post="post" />
      </RouterLink>
    </VStack>
  </div>
</template>

<style scoped lang="sass">
  .bygSocial
    margin: var(--padding) 0
    min-height: 100vh

  .postLink
    width: 100%

    .postList
      gap: 0.5rem
</style>
