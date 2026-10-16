<script setup lang="ts">
  import { computed } from 'vue'

  import SafeLink from '@/components/base/SafeLink.vue'
  import MessageThreadItem from '@/components/messages/MessageThreadItem.vue'
  import MentionSuggestions from '@/components/posts/MentionSuggestions.vue'
  import type { BygUserSuggestion } from '@/types/mentions'
  import type { BygMessageThread } from '@/types/messages'

  const props = defineProps<{
    visible: boolean
    only: boolean
    loading: boolean
    threads: BygMessageThread[]
    selectedThread: BygMessageThread | null
    typingByUserId: Record<number, boolean>
    starterQuery: string
    starterSuggestions: BygUserSuggestion[]
    showingStarterSuggestions: boolean
    getThreadTypingUserId: (thread: BygMessageThread) => number | null
  }>()

  const emit = defineEmits<{
    refresh: []
    createGroup: []
    updateStarterSuggestions: []
    chooseStarterSuggestion: [username: string]
    'update:starterQuery': [value: string]
    select: [thread: BygMessageThread]
    info: [thread: BygMessageThread]
  }>()

  const starterQueryModel = computed({
    get: () => props.starterQuery,
    set: (value: string) => emit('update:starterQuery', value),
  })
</script>

<template>
  <aside v-if="visible" class="threadsPane" :class="{ only }">
    <header class="threadsHeader">
      <SafeLink to="/">
        <button class="backButton transparent">
          <Icon name="solar:alt-arrow-left-line-duotone" />
          {{ $t('common.back') }}
        </button>
      </SafeLink>

      <button
        class="refreshThreadsButton"
        :disabled="loading"
        @click="emit('refresh')"
      >
        <Icon name="solar:refresh-line-duotone" />
        {{ $t('common.refresh') }}
      </button>
    </header>

    <div class="starterBox">
      <input
        v-model="starterQueryModel"
        class="starterInput"
        :placeholder="$t('ui.chat.startChatPlaceholder')"
        @input="emit('updateStarterSuggestions')"
        @focus="emit('updateStarterSuggestions')"
      />

      <MentionSuggestions
        v-if="showingStarterSuggestions"
        :suggestions="starterSuggestions"
        @select="emit('chooseStarterSuggestion', $event)"
      />
    </div>

    <button class="createGroupButton" @click="emit('createGroup')">
      <Icon name="solar:users-group-rounded-line-duotone" />
      {{ $t('ui.messages.createGroupChat') }}
    </button>

    <div class="threadsContent">
      <p v-if="loading" class="light threadState">
        {{ $t('ui.chat.loadingChats') }}
      </p>
      <p v-else-if="threads.length < 1" class="light threadState">
        {{ $t('ui.chat.noMessagesYet') }}
      </p>

      <div class="threadList" v-else>
        <MessageThreadItem
          v-for="thread in threads"
          :key="thread.conversationId"
          :thread="thread"
          :selected="selectedThread?.conversationId === thread.conversationId"
          :typing="
            getThreadTypingUserId(thread) !== null
              ? typingByUserId[getThreadTypingUserId(thread)!]
              : false
          "
          @select="emit('select', thread)"
          @info="emit('info', thread)"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="sass">
  .threadsPane
    width: 100%
    height: 100%
    min-width: 0
    min-height: 0
    padding: 0.2rem
    display: flex
    flex-direction: column
    gap: 0.75rem
    overflow: hidden

    &.only
      width: 100%

    .threadsHeader
      width: 100%
      display: flex
      justify-content: space-between
      flex-wrap: nowrap
      align-items: center

    .starterBox
      width: 100%
      position: relative

      .starterInput
        width: 100%

      :deep(.mentionSuggestions)
        top: calc(100% + 0.35rem)
        left: 0
        right: 0
        width: 100%
        max-width: none

    .createGroupButton
      width: 100%
      justify-content: center

    .threadsContent
      width: 100%
      flex: 1 1 auto
      min-height: 0
      display: flex
      flex-direction: column

      .threadState
        margin: 0.2rem 0

      .threadList
        width: 100%
        flex: 1 1 auto
        min-height: 0
        overflow: auto
        gap: 0
        border-radius: 0
</style>
