<script setup lang="ts">
  import PostItem from '@/components/posts/PostItem.vue'
  import { onMounted, ref, type Ref } from 'vue'
  import type { BygPost } from '@/types/contentTypes.ts'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import { useRoute } from 'vue-router'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'

  const route = useRoute()
  const id = Number(route.params.slug)
  const post: Ref<BygPost | undefined> = ref()

  onMounted(async () => {
    console.log(id)
    const data = await fetch(
      `${import.meta.env.VITE_API_BASE}/post-details/${id}`
    )
    post.value = (await data.json()) as BygPost
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
