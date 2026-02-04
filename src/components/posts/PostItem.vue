<script setup lang="ts">
  import type { BygPost } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { nextTick, ref, watchEffect } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import LikeButton from '@/components/posts/LikeButton.vue'
  import ReportButton from '@/components/posts/ReportButton.vue'
  import ShareButton from '@/components/posts/ShareButton.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import { formatDate } from '@/utils/formatters.ts'

  const props = defineProps<{
    post: BygPost
    detailMode?: boolean
  }>()
  defineEmits([ 'navigate' ])

  const renderedContent = ref('')
  const expanded = ref(false)
  const contentEl = ref<HTMLElement | null>(null)
  const isClippable = ref(false)

  watchEffect(async () => {
    const html = await marked.parse(props.post.content ?? '')
    renderedContent.value = DOMPurify.sanitize(html)
    await nextTick()

    if (contentEl.value && !props.detailMode) {
      const el = contentEl.value

      // force clamp temporarily to measure overflow
      el.classList.add('clipped')

      await nextTick()

      isClippable.value = el.scrollHeight > el.clientHeight + 1

      // remove clamp if not needed
      if (!isClippable.value) {
        el.classList.remove('clipped')
      }
    }
  })
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
      <UsernameView :name="post.author" />
      <p>{{ formatDate(post.createdDate) }}</p>
    </HStack>

    <VStack class="bygPostContentWrapper">
      <p
        ref="contentEl"
        class="bygPostContent"
        :class="{ clipped: !detailMode && !expanded && isClippable }"
      >
        <span v-html="renderedContent" />
      </p>

      <button
        v-if="!detailMode && !expanded && isClippable"
        class="showMore transparent"
        @click.stop="expanded = true"
      >
        Show more
      </button>
    </VStack>

    <HStack class="postActions autoSpace" @click.stop>
      <HStack>
        <LikeButton
          :id="post.id"
          :likes="post.likes"
          api-path="/like-post"
          :compact="!detailMode"
        />

        <HStack class="noSpace">
          <Icon icon="solar:chat-round-line-line-duotone" />
          {{ post.commentCount }}
        </HStack>
      </HStack>

      <HStack>
        <ShareButton
          :id="post.id"
          :shares="post.shares"
          api-path="/share-post"
          :compact="!detailMode"
        />

        <ReportButton />
      </HStack>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/variables"
  @use "@/styles/utils"

  .bygPostItem
    align-items: flex-start
    @include utils.maxPostPaddedWidth

    &:not(.detailMode)
      @include utils.itemBackground
      cursor: pointer

    .postMeta
      opacity: 0.7
      margin-bottom: 1rem

    .bygPostContentWrapper
      position: relative

    .bygPostContent
      user-select: text
      --webkit-user-select: text

      &.clipped
        display: -webkit-box
        -webkit-line-clamp: 5
        -webkit-box-orient: vertical
        overflow: hidden
        mask: linear-gradient(to bottom, black, black, transparent)

    .showMore
      margin-top: 0.25rem

    .postActions
      margin-top: 0.75rem
</style>
