<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { useHead } from '#imports'
  import { onMounted, onUnmounted, type Ref, ref } from 'vue'

  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showBackButton, title } from '@/data/title'
  import CommentsView from '@/views/CommentsView.vue'
  import { useRoute } from '#app'

  const route = useRoute()
  const id = Number(route.params.slug)
  const image: Ref<BygImage | undefined> = ref()

  title.value = 'Loading...'
  showBackButton.value = true

  useHead(() => {
    if (!image.value) {
      return {
        title: 'Loading Byg image...',
      }
    }

    return {
      title: `Image: "${image.value.title}"`,
      meta: [
        {
          name: 'description',
          content: `View ${image.value.author}'s image on Byg.`,
        },
      ],
    }
  })

  onMounted(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}/image-details/${id}`
    )

    image.value = (await res.json()) as BygImage
    title.value = `${image.value.author}'s Image`
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="imageDetails">
    <VStack v-if="image == undefined" class="fullWidth">
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
