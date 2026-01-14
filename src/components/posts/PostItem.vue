<script setup lang="ts">
  import type { BygPost } from '@/types/contentTypes.ts'
  import HStack from '@/components/layout/HStack.vue'
  import { Icon } from '@iconify/vue'
  import { ref, type Ref } from 'vue'

  const props = defineProps<{
    post: BygPost
    detailMode?: boolean
  }>()
  const likes: Ref<number> = ref(props.post.likes)
  defineEmits(['navigate'])

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

  function likePost(id: number) {
    fetch(`${import.meta.env.VITE_API_BASE}/like-post/${id}`, {
      method: 'POST',
    })

    likes.value += 1
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
      {{ post.content }}
    </p>

    <HStack class="postActions" @click.stop>
      <button @click="likePost(post.id)">
        <Icon icon="solar:hearts-line-duotone" />
        {{ detailMode ? likes : formatCount(likes) }}
      </button>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"
  @use "@/styles/variables"
  @use "@/styles/utils"

  .bygPostItem
    --postPadding: 0.75rem

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
