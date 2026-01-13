<script setup lang="ts">
  import PostItem from '@/components/posts/PostItem.vue'
  import { onMounted, ref, type Ref } from 'vue'
  import type { BygPost } from '@/types/contentTypes.ts'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import { useRoute } from 'vue-router'

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
  <div class="postDetails">
    <EmptyState message="Post is loading." v-if="post == undefined" />
    <PostItem v-else :post="post" />
  </div>
</template>

<style scoped lang="sass">
  .postDetails
    margin: var(--padding) 0
    min-height: 100vh
    min-width: 100%
</style>
