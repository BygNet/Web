<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { useAsyncData, useHead, useRequestURL, useSeoMeta } from 'nuxt/app'
  import { computed, onUnmounted, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'

  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showBackButton, title } from '@/data/title'
  import { getApiBaseUrl, joinUrl } from '@/utils/runtimeConfig'
  import CommentsView from '@/views/CommentsView.vue'

  const route = useRoute()
  const requestUrl = useRequestURL()
  const id = computed(() => Number(route.params.slug))

  title.value = 'Loading...'
  showBackButton.value = true

  const {
    data: image,
    error,
    status,
  } = await useAsyncData(
    () => `image-details:${id.value}`,
    () =>
      $fetch<BygImage>(joinUrl(getApiBaseUrl(), `/image-details/${id.value}`)),
    {
      watch: [ id ],
    }
  )

  const pageTitle = computed(() => {
    if (!image.value) return 'Loading Byg image...'
    return `Image: "${image.value.title}"`
  })

  const pageDescription = computed(() => {
    if (!image.value) return 'View an image on Byg.'
    return `View ${image.value.author}'s image on Byg. ${image.value.title}`.trim()
  })

  const canonicalUrl = computed(() => {
    return new URL(`/image/${id.value}`, requestUrl.origin).toString()
  })

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: 'article',
    ogImage: computed(() => image.value?.imageUrl),
    ogUrl: canonicalUrl,
    twitterCard: computed(() =>
      image.value?.imageUrl ? 'summary_large_image' : 'summary'
    ),
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    twitterImage: computed(() => image.value?.imageUrl),
    robots: computed(() =>
      error.value ? 'noindex, nofollow' : 'index, follow'
    ),
  })

  useHead(() => ({
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl.value,
      },
    ],
  }))

  watchEffect(() => {
    title.value = image.value ? `${image.value.author}'s Image` : 'Loading...'
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="imageDetails">
    <VStack v-if="status === 'pending'" class="fullWidth">
      <div class="fullWidth skeleton" style="height: 50vh" />
      <SkeletonUser />
      <SkeletonText :lines="1" />
    </VStack>

    <ErrorState v-else-if="error" message="Failed to load image." />

    <ImageItem
      v-else-if="image"
      :image="image"
      detail-mode
      class="imageDetail"
    />

    <Divider />

    <VStack v-if="status === 'pending'" class="fullWidth">
      <h2>Comments</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <CommentsView
      v-else-if="image"
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
