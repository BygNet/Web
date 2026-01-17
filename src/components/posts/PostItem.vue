<script setup lang="ts">
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { ref, watchEffect } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import LikeButton from '@/components/posts/LikeButton.vue'
  import ShareButton from '@/components/posts/ShareButton.vue'
  import type { BygPost } from '@/types/contentTypes.ts'

  const props = defineProps<{
    post: BygPost
    detailMode?: boolean
  }>()
  defineEmits([ 'navigate' ])

  const renderedContent = ref('')

  watchEffect(async () => {
    const html = await marked.parse(props.post.content ?? '')
    renderedContent.value = DOMPurify.sanitize(html)
  })

  function formatDate(input: string): string {
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return input

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  function formatCount(value: number): string {
    if (value < 1_000) return String(value)

    if (value < 1_000_000) {
      const v = value / 1_000
      return `${Math.floor(v * 10) / 10}k`
    }

    if (value < 1_000_000_000) {
      const v = value / 1_000_000
      return `${Math.floor(v * 10) / 10}M`
    }

    const v = value / 1_000_000_000
    return `${Math.floor(v * 10) / 10}B`
  }
</script>

<template>
  <div
    class="bygPostItem"
    @click="$emit('navigate')"
    :class="{ detailMode: detailMode }"
  >
    <h4 v-if="!detailMode">{{ post.title }}</h4>
    <h2 v-else>{{ post.title }}</h2>

    <HStack class="autoSpace postMeta">
      <p>{{ post.author }}</p>
      <p>{{ formatDate(post.createdDate) }}</p>
    </HStack>

    <p class="bygPostContent">
      <span v-html="renderedContent" />
    </p>

    <HStack class="postActions autoSpace" @click.stop>
      <LikeButton
        :id="post.id"
        :likes="post.likes"
        api-path="/like-post"
        :compact="!detailMode"
      />

      <ShareButton :id="post.id" :shares="post.shares" api-path="/share-post" />
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"
  @use "@/styles/variables"
  @use "@/styles/utils"

  .bygPostItem
    align-items: flex-start
    width: calc(100% - var(--postPadding)*2)

    &:not(.detailMode)
      @include utils.itemBackground
      cursor: pointer

    .postMeta
      opacity: 0.7
      margin-bottom: 1rem

    .bygPostContent
      user-select: text
      --webkit-user-select: text

    .postActions
      margin-top: 0.75rem
</style>
