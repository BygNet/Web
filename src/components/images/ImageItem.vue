<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { useRouter } from 'vue-router'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import LikeButton from '@/components/posts/LikeButton.vue'
  import ReportButton from '@/components/posts/ReportButton.vue'
  import ShareButton from '@/components/posts/ShareButton.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import { formatDate } from '@/utils/formatters.ts'

  const props = defineProps<{
    image: BygImage
    detailMode?: boolean
  }>()

  const router = useRouter()

  function openDetails() {
    if (props.detailMode) return
    router.push(`/image/${props.image.id}`)
  }
</script>

<template>
  <div class="imageItem" :class="{ detail: detailMode }" @click="openDetails">
    <img :src="image.imageUrl" :alt="image.title" loading="lazy" />

    <VStack class="info">
      <VStack class="noRound">
        <h3>{{ image.title }}</h3>

        <VStack class="imageMeta noSpace">
          <UsernameView :name="image.author" />
          <p>{{ formatDate(image.createdDate) }}</p>
        </VStack>
      </VStack>

      <HStack class="autoSpace actions" @click.stop>
        <HStack>
          <LikeButton
            :id="image.id"
            :likes="image.likes"
            api-path="/like-image"
            :compact="!detailMode"
          />

          <HStack class="noSpace">
            <Icon icon="solar:chat-round-line-line-duotone" />
            {{ image.commentCount }}
          </HStack>
        </HStack>

        <HStack>
          <ShareButton
            :shares="image.shares"
            :share-item="{
              type: 'image',
              id: image.id,
              title: image.title,
              author: image.author,
              imageUrl: image.imageUrl,
              shareApiPath: '/share-image',
            }"
            :compact="!detailMode"
          />

          <ReportButton />
        </HStack>
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

    &.detail
      border-radius: 0

    &:not(.detail)
      @include utils.itemBackground
      padding: 0

      img
        border-radius: 1rem

      .info
        padding: 0 0.75rem 0.75rem

    &.detail
      cursor: default

      img
        height: auto

    img
      width: 100%
      height: 18rem
      object-fit: cover

    .info
      flex-grow: 1
      width: 100%
      border-radius: 0
      justify-content: space-between

      .imageMeta p
        opacity: 0.7
</style>
