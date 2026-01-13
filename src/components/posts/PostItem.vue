<script setup lang="ts">
  import type { BygPost } from '@/types/contentTypes.ts'
  import HStack from '@/components/layout/HStack.vue'
  import { Icon } from '@iconify/vue'
  import { ref, type Ref } from 'vue'

  const props = defineProps<{
    post: BygPost
  }>()
  const likes: Ref<number> = ref(props.post.likes)

  function formatDate(input: string): string {
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return input

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  function likePost(id: number) {
    fetch(`${import.meta.env.VITE_API_BASE}/like-post/${id}`, {
      method: 'POST',
    })

    likes.value += 1
  }
</script>

<template>
  <div class="bygPostItem">
    <h4>{{ post.title }}</h4>
    <HStack class="autoSpace postMeta">
      <p>{{ post.author }}</p>
      <p>{{ formatDate(post.createdDate) }}</p>
    </HStack>

    <p class="bygPostContent">
      {{ post.content }}
    </p>

    <HStack class="postActions">
      <button @click="likePost(post.id)">
        <Icon icon="solar:hearts-line-duotone" />
        {{ likes }}
      </button>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"
  @use "@/styles/variables"

  .bygPostItem
    --postPadding: 0.75rem

    align-items: flex-start
    padding: 0.75rem
    background: colors.$foregroundColor
    width: calc(100% - var(--postPadding)*2)
    border-radius: 1.75rem

    .postMeta
      opacity: 0.7
      margin-bottom: 1rem

    .bygPostContent
      user-select: text
      --webkit-user-select: text

    .postActions
      margin-top: 0.75rem
</style>
