<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import LikeButton from '@/components/posts/LikeButton.vue'
  import ShareButton from '@/components/posts/ShareButton.vue'
  import type { BygImage } from '@/types/contentTypes'

  const props = defineProps<{
    image: BygImage
    detailMode?: boolean
  }>()

  const router = useRouter()

  const createdLabel = computed(() =>
    new Date(props.image.createdDate).toLocaleDateString()
  )

  function openDetails() {
    if (props.detailMode) return
    router.push(`/image/${props.image.id}`)
  }
</script>

<template>
  <div class="imageItem" :class="{ detail: detailMode }" @click="openDetails">
    <img :src="image.imageUrl" :alt="image.title" loading="lazy" />

    <VStack class="info">
      <h3>{{ image.title }}</h3>

      <HStack class="meta autoSpace">
        <p>{{ image.author }}</p>
        <p>{{ createdLabel }}</p>
      </HStack>

      <HStack class="autoSpace actions" @click.stop>
        <LikeButton
          :id="image.id"
          :likes="image.likes"
          api-path="/like-image"
          :compact="!detailMode"
        />

        <ShareButton
          :id="image.id"
          :shares="image.shares"
          api-path="/share-image"
          :compact="!detailMode"
        />
      </HStack>
    </VStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .imageItem
    overflow: hidden
    display: flex
    flex-direction: column
    cursor: pointer

    &:not(.detail)
      @include utils.itemBackground

    &.detail
      cursor: default

      img
        height: auto

    img
      width: 100%
      height: 18rem
      object-fit: cover

    .info
      width: 100%
      padding: 0.75rem 1rem 0

    .meta
      opacity: 0.7
</style>
