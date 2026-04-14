<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'
  import { useHead } from '@unhead/vue'
  import { onMounted, onUnmounted, type Ref, ref } from 'vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonPost from '@/components/layout/skeletons/SkeletonPost.vue'
  import VStack from '@/components/layout/VStack.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { showBackButton, title } from '@/data/title.ts'
  import CommentsView from '@/views/CommentsView.vue'
  import { useRoute } from '#app'

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
    <SkeletonPost v-if="post == undefined" class="fullWidth" />
    <PostItem v-else :post="post" detail-mode class="postDetail" />

    <Divider />

    <VStack v-if="post == undefined" class="fullWidth">
      <h2>Comments</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <CommentsView
      v-else
      :id="post.id"
      :author="post.author"
      getUrl="/post-comments"
      postUrl="/comment-post"
      :count="post.commentCount"
    />
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .postDetail
    width: 100%
</style>
