<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'
  import { useAsyncData, useHead, useRequestURL, useSeoMeta } from 'nuxt/app'
  import { computed, onUnmounted, watchEffect } from 'vue'
  import { useRoute } from 'vue-router'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonPost from '@/components/layout/skeletons/SkeletonPost.vue'
  import VStack from '@/components/layout/VStack.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { showBackButton, title } from '@/data/title'
  import { getApiBaseUrl, joinUrl } from '@/utils/runtimeConfig'
  import CommentsView from '@/views/CommentsView.vue'

  const route = useRoute()
  const requestUrl = useRequestURL()
  const id = computed(() => Number(route.params.slug))

  title.value = 'Loading...'
  showBackButton.value = true

  const {
    data: post,
    error,
    status,
  } = await useAsyncData(
    () => `post-details:${id.value}`,
    () =>
      $fetch<BygPost>(joinUrl(getApiBaseUrl(), `/post-details/${id.value}`)),
    {
      watch: [ id ],
    }
  )

  const pageTitle = computed(() => {
    if (!post.value) return 'Loading Byg post...'
    return `Post: "${post.value.title}"`
  })

  const pageDescription = computed(() => {
    if (!post.value) return 'View a post on Byg.'

    const preview = (post.value.content ?? '').trim().replace(/\s+/g, ' ')
    const excerpt = preview ? ` ${preview.slice(0, 140)}` : ''
    return `View ${post.value.author}'s post on Byg.${excerpt}`.trim()
  })

  const canonicalUrl = computed(() => {
    return new URL(`/details/${id.value}`, requestUrl.origin).toString()
  })

  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: 'article',
    ogUrl: canonicalUrl,
    twitterCard: 'summary',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
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
    title.value = post.value ? `${post.value.author}'s Post` : 'Loading...'
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="postDetails">
    <SkeletonPost v-if="status === 'pending'" class="fullWidth" />
    <ErrorState v-else-if="error" message="Failed to load post." />
    <PostItem v-else-if="post" :post="post" detail-mode class="postDetail" />

    <Divider />

    <VStack v-if="status === 'pending'" class="fullWidth">
      <h2>Comments</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <CommentsView
      v-else-if="post"
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
