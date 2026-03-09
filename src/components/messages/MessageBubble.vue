<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { type Ref, ref, watch } from 'vue'

  import type { BygMessage } from '@/types/messages'
  import { formatDate } from '@/utils/formatters'

  const props = defineProps<{
    message: BygMessage
    outgoing: boolean
  }>()

  const renderedContent: Ref<string> = ref('')
  const showingTime: Ref<boolean> = ref(false)

  watch(
    () => props.message.content,
    async () => {
      const parsed = await marked.parse(props.message.content ?? '')
      renderedContent.value = DOMPurify.sanitize(parsed as string)
    },
    { immediate: true }
  )
</script>

<template>
  <div
    class="messageRow"
    @click="showingTime = !showingTime"
    :class="{ outgoing: outgoing }"
  >
    <img
      v-if="!outgoing && message.senderAvatarUrl"
      class="senderAvatar"
      :src="message.senderAvatarUrl"
      :alt="`${message.senderUsername}'s avatar`"
    />
    <Icon
      v-else-if="!outgoing"
      class="senderAvatar fallback"
      icon="solar:user-circle-line-duotone"
    />

    <div class="bubbleWrap" :class="{ outgoing: outgoing }">
      <div class="bubble" :class="{ outgoing: outgoing }">
        <RouterLink
          v-if="message.sharedPost"
          class="sharedEmbed postEmbed"
          :to="`/details/${message.sharedPost.id}`"
        >
          <h4>{{ message.sharedPost.title }}</h4>
          <p class="light">Post by {{ message.sharedPost.author }}</p>
          <p class="embedPreview">{{ message.sharedPost.content }}</p>
        </RouterLink>

        <RouterLink
          v-if="message.sharedImage"
          class="sharedEmbed imageEmbed"
          :to="`/image/${message.sharedImage.id}`"
        >
          <img
            :src="message.sharedImage.imageUrl"
            :alt="message.sharedImage.title"
          />
          <div class="imageEmbedMeta">
            <h4>{{ message.sharedImage.title }}</h4>
            <p class="light">{{ message.sharedImage.author }}</p>
          </div>
        </RouterLink>

        <div
          v-if="message.content.trim()"
          class="messageContent"
          v-html="renderedContent"
        />
      </div>

      <p class="bubbleTime light" v-if="showingTime">
        {{ formatDate(message.createdDate) }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .messageRow
    width: 100%
    flex-direction: row
    align-items: flex-end
    justify-content: flex-start
    gap: 0.35rem
    min-width: 0
    margin-bottom: 0.1rem

    &.outgoing
      justify-content: flex-end

  .senderAvatar
    width: 1.3rem
    height: 1.3rem
    border-radius: 50%

    &.fallback
      border-radius: 0

  .bubbleWrap
    max-width: min(38rem, 86%)
    min-width: 0
    align-items: flex-start
    gap: 0.1rem

    &.outgoing
      align-items: flex-end

  .bubble
    --cornerRadius: 1.25rem
    width: fit-content
    max-width: 100%
    align-items: flex-start
    gap: 0.45rem
    padding: 0.55rem 0.7rem
    border-radius: var(--cornerRadius)
    border-bottom-left-radius: 0.5rem
    background: themes.$foregroundColor

    &.outgoing
      background: themes.$accentColor
      border-bottom-right-radius: 0.5rem
      border-bottom-left-radius: var(--cornerRadius)

  .messageContent
    width: 100%
    min-width: 0
    align-items: flex-start

    :deep(p)
      margin: 0

  .sharedEmbed
    width: 100%
    box-sizing: border-box
    display: flex
    flex-direction: column
    gap: 0.35rem
    align-items: flex-start
    padding: 0.6rem
    border-radius: 0.9rem
    text-decoration: none

    .embedPreview
      width: 100%
      max-height: 4.5rem
      overflow: hidden

    &.imageEmbed
      .imageEmbedMeta
        width: 100%
        display: flex
        align-items: center
        justify-content: space-between
        gap: 0.35rem

        h4, p
          margin: 0

      img
        width: 100%
        border-radius: 0.75rem

  .bubbleTime
    font-size: x-small
    margin: 0.1rem 0.25rem
</style>
