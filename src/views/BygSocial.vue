<script setup lang="ts">
  import { nextTick, onMounted, onUnmounted, type Ref, ref } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import VStack from '@/components/layout/VStack.vue'
  import NewPostsAvailable from '@/components/posts/NewPostAvailable.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { title } from '@/data/title.ts'
  import type { BygPost } from '@/types/contentTypes.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  const posts: Ref<BygPost[]> = ref([])
  const isLoaded: Ref<boolean> = ref(false)
  const hasNewPosts: Ref<boolean> = ref(false)

  let interval: number | undefined

  title.value = 'Social'
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
  <ContentArea class="bygSocial">
    <p id="top" />
    <EmptyState v-if="!isLoaded" message="Loading posts." />

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
