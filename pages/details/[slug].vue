<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'
  import { onUnmounted, type Ref, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import Divider from '@/components/layout/Divider.vue'
  import SkeletonComment from '@/components/layout/skeletons/SkeletonComment.vue'
  import SkeletonPost from '@/components/layout/skeletons/SkeletonPost.vue'
  import VStack from '@/components/layout/VStack.vue'
  import PostItem from '@/components/posts/PostItem.vue'
  import { getCachedPostDetail, setCachedPostDetail } from '@/data/caches'
  import { showBackButton, title } from '@/data/title'
  import { useEnv } from '@/utils/env'
  import CommentsView from '@/views/CommentsView.vue'
  import { useRoute } from '#app'
  import { useHead, useLazyAsyncData } from '#imports'

  const route = useRoute()
  const { t } = useI18n()
  const slug = route.params.slug
  const id = slug && !Number.isNaN(Number(slug)) ? Number(slug) : null

  const error: Ref<string | null> = ref(null)

  title.value = t('ui.details.postTitle')
  showBackButton.value = true

  // Fetch post data - track for meta tags
  let postMetaData: BygPost | null = null
  const { data: post } = await useLazyAsyncData(
    `post-${id}`,
    async () => {
      if (!id) return null

      const cached = getCachedPostDetail(id)
      if (cached) {
        postMetaData = cached
        return cached
      }

      try {
        const response = await fetch(`${useEnv().apiBase}/post-details/${id}`)
        if (!response.ok) throw new Error(`API error: ${response.status}`)
        const json = (await response.json()) as BygPost
        setCachedPostDetail(id, json)
        postMetaData = json
        return json
      } catch (err) {
        console.error('Failed to fetch post:', err)
        return null
      }
    },
    {
      server: import.meta.server,
      lazy: import.meta.client,
    }
  )

  // Set meta tags for SEO with fetched post data
  useHead(() => {
    if (postMetaData) {
      return {
        title: t('ui.details.postMetaTitle', { title: postMetaData.title }),
        meta: [
          {
            name: 'description',
            content: t('ui.details.postMetaDescription', {
              author: postMetaData.author,
            }),
          },
        ],
      }
    }

    return {
      title: t('ui.details.postMetaFallbackTitle'),
      meta: [
        {
          name: 'description',
          content: t('ui.details.postMetaFallbackDescription'),
        },
      ],
    }
  })

  onUnmounted(() => {
    showBackButton.value = false
  })
</script>

<template>
  <ContentArea class="postDetails">
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <SkeletonPost v-else-if="post == undefined" class="fullWidth" />
    <ClientOnly v-else>
      <PostItem :post="post" detail-mode class="postDetail" />
    </ClientOnly>

    <Divider />

    <VStack v-if="post == undefined" class="fullWidth">
      <h2>{{ t('common.comments') }}</h2>
      <SkeletonComment v-for="i in 5" :key="i" />
    </VStack>

    <ClientOnly v-else>
      <CommentsView
        :id="post.id"
        :author="post.author"
        getUrl="/post-comments"
        postUrl="/comment-post"
        :count="post.commentCount"
      />
    </ClientOnly>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .postDetail
    width: 100%
</style>
