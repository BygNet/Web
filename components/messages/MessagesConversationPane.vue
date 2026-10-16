<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import MessageBubble from '@/components/messages/MessageBubble.vue'
  import type { BygMessage, BygMessageThread } from '@/types/messages'
  import type { ConversationEntry } from '@/types/messages-ui'

  const props = defineProps<{
    visible: boolean
    isMobileConversationView: boolean
    selectedThread: BygMessageThread | null
    connectedLive: boolean
    error: string | null
    loadingConversation: boolean
    loadingOlderMessages: boolean
    conversationEntries: ConversationEntry[]
    replyToMessage: BygMessage | null
    typing: boolean
    composerText: string
    sendingMessage: boolean
    getThreadDisplayName: (thread: BygMessageThread) => string
  }>()

  const emit = defineEmits<{
    closeMobile: []
    scroll: []
    reply: [message: BygMessage]
    openReply: [messageId: number]
    'update:composerText': [value: string]
    composerInput: []
    composerBlur: []
    cancelReply: []
    send: []
  }>()

  const { t } = useI18n()
  const conversationScroller = ref<HTMLDivElement | null>(null)
  const composerInput = ref<HTMLTextAreaElement | null>(null)
  const composerTextModel = computed({
    get: () => props.composerText,
    set: (value: string) => emit('update:composerText', value),
  })

  defineExpose({ conversationScroller, composerInput })
</script>

<template>
  <section v-if="visible" class="conversationPane">
    <header class="conversationHeader">
      <HStack class="conversationTitleWrap">
        <button
          v-if="isMobileConversationView"
          class="mobileBackButton"
          @click="emit('closeMobile')"
        >
          <Icon name="solar:arrow-left-line-duotone" />
        </button>

        <div class="conversationTitle">
          <h3 v-if="selectedThread">
            {{
              selectedThread.type === 'direct'
                ? `@${getThreadDisplayName(selectedThread)}`
                : getThreadDisplayName(selectedThread)
            }}
          </h3>
          <h3 v-else>{{ t('ui.chat.selectChat') }}</h3>

          <HStack class="connectionState">
            <Icon
              :name="
                connectedLive
                  ? 'solar:cloud-check-line-duotone'
                  : 'solar:cloud-cross-line-duotone'
              "
            />
            <p class="light">
              {{
                connectedLive
                  ? t('ui.chat.statusLive')
                  : t('ui.chat.statusOffline')
              }}
            </p>
          </HStack>
        </div>
      </HStack>
    </header>

    <ErrorState v-if="error" :message="error" />

    <div
      v-else-if="!selectedThread && !loadingConversation"
      class="conversationEmpty"
    >
      <Icon name="solar:chat-round-line-line-duotone" />
      <h3>{{ t('ui.chat.emptyState') }}</h3>
    </div>

    <div v-else class="conversationBody">
      <p v-if="loadingConversation" class="light loadingConversationText">
        {{ t('ui.chat.loadingConversation') }}
      </p>

      <div
        ref="conversationScroller"
        class="messageList"
        @scroll="emit('scroll')"
      >
        <p v-if="loadingOlderMessages" class="light historyLoading">
          {{ t('ui.chat.loadingOlderMessages') }}
        </p>
        <template v-for="entry in conversationEntries" :key="entry.key">
          <p v-if="entry.type === 'timestamp'" class="light messageGapMarker">
            {{ entry.label }}
          </p>
          <MessageBubble
            v-else
            :message="entry.message"
            :outgoing="entry.outgoing"
            :show-avatar="entry.showAvatar"
            :show-sender-name="entry.showSenderName"
            :group-position="entry.groupPosition"
            :delivery-state="entry.deliveryState"
            @reply="emit('reply', entry.message)"
            @open-reply="emit('openReply', $event)"
          />
        </template>
      </div>

      <VStack class="composer" @click.stop>
        <HStack v-if="typing" class="typingIndicator">
          <Icon name="svg-spinners:3-dots-move" />
          <p>{{ t('ui.chat.typing') }}</p>
        </HStack>

        <HStack v-if="replyToMessage" class="replyComposerPreview">
          <VStack class="noSpace">
            <p>
              {{
                t('ui.chat.replyingTo', {
                  username: replyToMessage.senderUsername,
                })
              }}
            </p>
            <p class="light">
              {{ replyToMessage.content || t('ui.chat.messageFallback') }}
            </p>
          </VStack>
          <button
            class="transparent"
            :aria-label="t('ui.chat.cancelReply')"
            @click="emit('cancelReply')"
          >
            <Icon name="mingcute:close-fill" />
          </button>
        </HStack>

        <HStack class="composerInputRow">
          <textarea
            ref="composerInput"
            v-model="composerTextModel"
            class="composerInput"
            :placeholder="t('ui.chat.typeMessagePlaceholder')"
            :disabled="!selectedThread"
            @input="emit('composerInput')"
            @blur="emit('composerBlur')"
            @keydown.enter.exact.prevent="emit('send')"
          />

          <button
            class="prominent sendButton"
            :disabled="
              !selectedThread || sendingMessage || !composerText.trim()
            "
            @mousedown.prevent
            @click="emit('send')"
          >
            <Icon name="solar:plain-line-duotone" />
            {{ t('ui.chat.send') }}
          </button>
        </HStack>
      </VStack>
    </div>
  </section>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .conversationPane
    width: 100%
    height: 100%
    padding: 0.2rem
    display: flex
    flex-direction: column
    min-height: 0
    overflow: hidden

    .conversationHeader
      width: 100%
      flex-shrink: 0
      gap: 0.5rem

      .conversationTitleWrap
        width: 100%
        flex-wrap: nowrap
        justify-content: space-between
        align-items: flex-start
        gap: 0.6rem

      .conversationTitle
        width: 100%
        min-width: 0
        align-items: flex-start
        gap: 0.25rem

        h3
          margin: 0
          word-break: break-word

      .connectionState
        align-items: center
        gap: 0.25rem

    .conversationEmpty
      width: 100%
      min-height: 0
      flex: 1 1 auto
      justify-content: center
      gap: 0.35rem
      text-align: center

    .conversationBody
      display: flex
      flex-direction: column
      flex: 1 1 auto
      min-height: 0
      width: 100%
      gap: 0.75rem

      .loadingConversationText
        margin: 0

      .historyLoading
        width: 100%
        margin: 0.25rem 0
        text-align: center
        font-size: x-small

      .messageList
        flex: 1 1 auto
        min-height: 0
        overflow: auto
        width: 100%
        align-items: stretch
        gap: 0.25rem
        border-radius: 0
        padding-right: 0.2rem
        padding-bottom: 0.2rem

        .messageGapMarker
          margin: 0.45rem auto 0.65rem
          width: fit-content
          font-size: x-small
          text-align: center

      .composer
        width: 100%
        flex-shrink: 0
        padding: 0.1rem

        .replyComposerPreview
          width: 100%
          justify-content: space-between
          align-items: center
          padding: 0.35rem 0.5rem
          background: themes.$foregroundColor
          border-radius: 1.25rem

          p
            max-width: 80%
            margin: 0
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap

            &:first-child
              font-size: small
              font-weight: 600

        .typingIndicator
          width: 100%
          gap: 0.25rem
          align-items: center

          p
            margin: 0

        .composerInputRow
          gap: 0.5rem
          width: 100%
          flex-wrap: nowrap
          align-items: flex-end

          .composerInput
            min-height: 2.5rem
            max-height: 8rem
            resize: none
            overflow-y: auto
            border-radius: 1rem
            flex-grow: 1

          .sendButton
            flex: 0 0 auto
            align-self: flex-end
</style>
