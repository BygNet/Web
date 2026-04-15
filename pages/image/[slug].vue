<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { useHead, useAsyncData } from '#imports'
  import { onUnmounted, ref, type Ref } from 'vue'

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

  const error: Ref<string | null> = ref(null)

  title.value = 'Byg Image'
  showBackButton.value = true

  // Fetch image data - track for meta tags
  let imageMetaData: BygImage | null = null
  const { data: image } = await useAsyncData(
    `image-${id}`,
    async () => {
      if (!id) return null
      try {
        const response = await fetch(`${useEnv().apiBase}/image-details/${id}`)
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const json = await response.json() as BygImage
        imageMetaData = json
        return json
      } catch (err) {
        console.error('Failed to fetch image:', err)
        return null
      }
    },
    { server: true }
  )

  // Set meta tags for SEO with fetched image data
  useHead(() => {
    if (imageMetaData) {
      return {
        title: `Image: "${imageMetaData.title}"`,
        meta: [
          {
            name: 'description',
            content: `View ${imageMetaData.author}'s image on Byg.`,
          },
        ],
      }
    }

    return {
      title: 'Byg Image',
      meta: [
        {
          name: 'description',
          content: 'View images on Byg social network.',
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

    <ClientOnly v-else>
      <ImageItem :image="image" detail-mode class="imageDetail" />
    </ClientOnly>

    <Divider />

    <VStack v-if="image == undefined" class="fullWidth">
      <h2>Comments</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <ClientOnly v-else>
      <CommentsView
        :id="image.id"
        :author="image.author"
        get-url="/image-comments"
        post-url="/comment-image"
        :count="image.commentCount"
      />
    </ClientOnly>
  </ContentArea>
</template>

<style scoped lang="sass">
  .imageDetail
    width: 100%
</style>
