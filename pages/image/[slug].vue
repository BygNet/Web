<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { useHead, useFetch } from '#imports'
  import { onUnmounted, watch } from 'vue'

  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showBackButton, title } from '@/data/title'
  import { useEnv } from '@/utils/env'
  import CommentsView from '@/views/CommentsView.vue'
  import { useRoute } from '#app'

  const route = useRoute()
  const slug = route.params.slug
  const id = slug && !Number.isNaN(Number(slug)) ? Number(slug) : null

  const apiBase = useEnv().apiBase

  // Fetch data during SSR and hydration
  const { data: image } = await useFetch(
    id ? `${apiBase}/image-details/${id}` : null,
    {
      immediate: true,
      server: true,
      retry: false,
      timeout: 5000,
    }
  ).catch(() => ({ data: null }))

  // Set page title and back button
  title.value = 'Loading...'
  showBackButton.value = true

  // Update title when image loads
  watch(
    () => image.value,
    (newImage) => {
      if (newImage) {
        title.value = `${(newImage as BygImage).author}'s Image`
      }
    }
  )

  // Set meta tags for SEO
  useHead(() => {
    if (!image.value) {
      return {
        title: 'Loading Byg image...',
      }
    }

    const img = image.value as BygImage
    return {
      title: `Image: "${img.title}"`,
      meta: [
        {
          name: 'description',
          content: `View ${img.author}'s image on Byg.`,
        },
      ],
    }
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="imageDetails">
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <VStack v-else-if="image == undefined" class="fullWidth">
      <div class="fullWidth skeleton" style="height: 50vh" />
      <SkeletonUser />
      <SkeletonText :lines="1" />
    </VStack>

    <ImageItem v-else :image="image" detail-mode class="imageDetail" />

    <Divider />

    <VStack v-if="image == undefined" class="fullWidth">
      <h2>Comments</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <CommentsView
      v-else
      :id="image.id"
      :author="image.author"
      get-url="/image-comments"
      post-url="/comment-image"
      :count="image.commentCount"
    />
  </ContentArea>
</template>

<style scoped lang="sass">
  .imageDetail
    width: 100%
</style>
