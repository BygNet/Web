<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { computed, type Ref, ref, watch } from 'vue'

  import type { BygMessage } from '@/types/messages'
  import { formatDate } from '@/utils/formatters'

  type MessageGroupPosition = 'single' | 'top' | 'middle' | 'bottom'
  type MessageDeliveryState = 'sending' | 'sent'
  const EMOJI_ONLY_PATTERN =
    /^[\p{Extended_Pictographic}\p{Emoji_Component}\u200D\uFE0F\s]+$/u

  const props = withDefaults(
    defineProps<{
      message: BygMessage
      outgoing: boolean
      showAvatar?: boolean
      groupPosition?: MessageGroupPosition
      deliveryState?: MessageDeliveryState | null
    }>(),
    {
      showAvatar: true,
      groupPosition: 'single',
      deliveryState: null,
    }
  )

  const renderedContent: Ref<string> = ref('')
  const showingTime: Ref<boolean> = ref(false)
  const isEmojiOnly = computed(() => {
    if (props.message.sharedPost || props.message.sharedImage) {
      return false
    }

    const content = props.message.content.trim()
    if (!content) return false
    return EMOJI_ONLY_PATTERN.test(content)
  })

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
    :class="[
      { outgoing: outgoing, emojiOnly: isEmojiOnly },
      `group-${props.groupPosition}`,
    ]"
  >
    <template v-if="!outgoing">
      <img
        v-if="props.showAvatar && message.senderAvatarUrl"
        class="senderAvatar"
        :src="message.senderAvatarUrl"
        :alt="`${message.senderUsername}'s avatar`"
      />
      <Icon
        v-else-if="props.showAvatar"
        class="senderAvatar fallback"
        icon="solar:user-circle-line-duotone"
      />
      <span v-else class="senderAvatar spacer" aria-hidden="true" />
    </template>

    <div class="bubbleWrap" :class="{ outgoing: outgoing }">
      <div
        class="bubble"
        :class="[
          { outgoing: outgoing, emojiOnly: isEmojiOnly },
          `group-${props.groupPosition}`,
        ]"
      >
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
          :class="{ emojiOnly: isEmojiOnly }"
          v-html="renderedContent"
        />
      </div>

      <div class="bubbleMeta light" v-if="outgoing && props.deliveryState">
        <Icon
          :icon="
            props.deliveryState === 'sent'
              ? 'solar:check-read-line-duotone'
              : 'solar:clock-circle-line-duotone'
          "
        />
        <p>{{ props.deliveryState === 'sent' ? 'Sent' : 'Sending…' }}</p>
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

    &.spacer
      display: block
      flex-shrink: 0

  .bubbleWrap
    max-width: min(38rem, 86%)
    min-width: 0
    align-items: flex-start
    gap: 0.1rem

    &.outgoing
      align-items: flex-end

  .bubble
    --cornerRadius: 1.25rem
    --groupCornerRadius: 0.55rem
    width: fit-content
    max-width: 100%
    align-items: flex-start
    gap: 0.45rem
    padding: 0.55rem 0.7rem
    border-radius: var(--cornerRadius)
    background: themes.$foregroundColor

    &.group-top
      border-bottom-left-radius: var(--groupCornerRadius)
      border-bottom-right-radius: var(--groupCornerRadius)

    &.group-middle
      border-top-left-radius: var(--groupCornerRadius)
      border-top-right-radius: var(--groupCornerRadius)
      border-bottom-left-radius: var(--groupCornerRadius)
      border-bottom-right-radius: var(--groupCornerRadius)

    &.group-bottom
      border-top-left-radius: var(--groupCornerRadius)
      border-top-right-radius: var(--groupCornerRadius)

    &.outgoing
      background: themes.$accentColor

    &.emojiOnly
      background: transparent !important
      padding: 0
      border-radius: 0

  .messageContent
    width: 100%
    min-width: 0
    align-items: flex-start

    :deep(p)
      margin: 0

    &.emojiOnly
      :deep(p)
        font-size: clamp(2rem, 7vw, 3rem)
        line-height: 1.2

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

  .bubbleMeta
    flex-direction: row
    align-items: center
    gap: 0.2rem
    margin: 0 0.25rem

    p
      margin: 0
      font-size: x-small
</style>
