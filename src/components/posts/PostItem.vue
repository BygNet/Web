<script setup lang="ts">
  import type { BygPost } from '@/types/contentTypes.ts'
  import HStack from '@/components/layout/HStack.vue'

  defineProps<{
    post: BygPost
  }>()
</script>

<template>
  <div class="bygPostItem">
    <h4>{{ post.title }}</h4>
    <HStack class="autoSpace postMeta">
      <p>{{ post.author }}</p>
      <p>{{ post.createdDate }}</p>
    </HStack>

    <p class="bygPostContent">
      {{ post.content }}
    </p>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"

  .bygPostItem
    --postPadding: 0.75rem

    align-items: flex-start
    padding: 0.75rem
    background: colors.$foregroundColor
    width: calc(100% - var(--postPadding)*2)

    .postMeta
      opacity: 0.7
      margin-bottom: 1rem

    .bygPostContent
      user-select: text
      --webkit-user-select: text
      white-space: pre-wrap
      word-break: break-word
      overflow-wrap: anywhere
</style>
