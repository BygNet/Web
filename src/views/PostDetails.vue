<script setup lang="ts">
  import { useHead } from '@unhead/vue'
  import { onMounted, onUnmounted, type Ref, ref } from 'vue'
  import { useRoute } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { showBackButton, title } from '@/data/title.ts'
  import type { BygPost } from '@/types/contentTypes.ts'

  const route = useRoute()
  const id = Number(route.params.slug)
  const post: Ref<BygPost | undefined> = ref()

  title.value = 'Loading...'
  showBackButton.value = true
  useHead(() => {
    if (!post.value) {
      return {
        title: 'Loading Byg post...',
      }
    }

    return {
      title: `Post: "${post.value.title}"`,
      meta: [
        {
          name: 'description',
          content: `View ${post.value.author}'s post on Byg.`,
        },
      ],
    }
  })

  onMounted(async () => {
    const data = await fetch(
      `${import.meta.env.VITE_API_BASE}/post-details/${id}`
    )
    post.value = (await data.json()) as BygPost

    title.value = `${post.value.author}'s Post`
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="postDetails">
    <EmptyState message="Post is loading." v-if="post == undefined" />
    <PostItem v-else :post="post" detail-mode />

    <Divider />

    <h3 class="light">No comments yet.</h3>
  </ContentArea>
</template>
