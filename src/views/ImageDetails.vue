<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { useHead } from '@unhead/vue'
  import { onMounted, onUnmounted, type Ref, ref } from 'vue'
  import { useRoute } from 'vue-router'

  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import { showBackButton, title } from '@/data/title'
  import CommentsView from '@/views/CommentsView.vue'

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
    <EmptyState v-if="image == undefined" message="Image is loading." />

    <ImageItem v-else :image="image" detail-mode class="imageDetail" />

    <Divider />

    <EmptyState v-if="image == undefined" message="Comments are loading." />
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
