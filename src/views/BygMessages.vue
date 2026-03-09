<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    watch,
  } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import { auth } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import MessageBubble from '@/components/messages/MessageBubble.vue'
  import MessageThreadItem from '@/components/messages/MessageThreadItem.vue'
  import MentionSuggestions from '@/components/posts/MentionSuggestions.vue'
  import { fetchUserSuggestions } from '@/data/mentions'
  import {
    createMessagesSocket,
    fetchMessageConversation,
    fetchMessageThreads,
    sendMessage,
    sendTypingEvent,
  } from '@/data/messages'
  import { title } from '@/data/title.ts'
  import type { BygUserSuggestion } from '@/types/mentions'
  import type {
    BygMessage,
    BygMessageConversation,
    BygMessageLiveServerEvent,
    BygMessageThread,
  } from '@/types/messages'
  import setHeadMeta from '@/utils/setHeadMeta'

  title.value = 'Chat'
  setHeadMeta({
    page: 'Chat',
    subtitle: 'Chat with your friends and family on Byg.',
  })

  const router = useRouter()
  const route = useRoute()

  const loadingThreads: Ref<boolean> = ref(true)
  const loadingConversation: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const threads: Ref<BygMessageThread[]> = ref([])
  const selectedThread: Ref<BygMessageThread | null> = ref(null)
  const messages: Ref<BygMessage[]> = ref([])
  const composerText: Ref<string> = ref('')
  const sendingMessage: Ref<boolean> = ref(false)
  const connectedLive: Ref<boolean> = ref(false)
  const typingByUserId: Ref<Record<number, boolean>> = ref({})

  const starterQuery: Ref<string> = ref('')
  const starterSuggestions: Ref<BygUserSuggestion[]> = ref([])
  const showingStarterSuggestions: Ref<boolean> = ref(false)
  let starterSuggestionRequestId = 0

  const conversationScroller: Ref<HTMLDivElement | null> = ref(null)
  const isMobileViewport: Ref<boolean> = ref(false)
  const liveSocket: Ref<WebSocket | null> = ref(null)
  let reconnectTimer: number | undefined
  let typingStopTimer: number | undefined
  const typingClearTimers = new Map<number, number>()
  let sentTypingState = false
  let allowSocketReconnect = true
  let mainEl: HTMLElement | null = null
  let savedOverflowY = ''

  const mobileMediaQuery = window.matchMedia('(max-width: 50rem)')
  isMobileViewport.value = mobileMediaQuery.matches

  function onMobileMediaChange(event: MediaQueryListEvent): void {
    isMobileViewport.value = event.matches
  }

  const isMobileConversationView = computed(() => {
    return (
      isMobileViewport.value &&
      typeof route.query.with === 'string' &&
      route.query.with.trim().length > 0
    )
  })
  const shouldShowThreadsPane = computed(() => {
    return !isMobileConversationView.value
  })
  const shouldShowConversationPane = computed(() => {
    return !isMobileViewport.value || isMobileConversationView.value
  })

  function normalizeUsername(value: string): string {
    return value.trim().toLowerCase()
  }

  function sortThreadsByDate(input: BygMessageThread[]): BygMessageThread[] {
    return [ ...input ].sort((a, b) => {
      return (
        new Date(b.lastMessageDate).getTime() -
        new Date(a.lastMessageDate).getTime()
      )
    })
  }

  function clearStarterSuggestions(): void {
    starterSuggestions.value = []
    showingStarterSuggestions.value = false
  }

  async function updateStarterSuggestions(): Promise<void> {
    const normalized = starterQuery.value.trim().replace(/^@/, '')
    if (!normalized) {
      clearStarterSuggestions()
      return
    }

    const requestId = ++starterSuggestionRequestId
    const suggestions = await fetchUserSuggestions(normalized)

    if (requestId !== starterSuggestionRequestId) {
      return
    }

    starterSuggestions.value = suggestions.filter(
      suggestion => suggestion.id !== auth.user?.id
    )
    showingStarterSuggestions.value = starterSuggestions.value.length > 0
  }

  function upsertThread(thread: BygMessageThread): void {
    const existingIndex = threads.value.findIndex(
      existing => existing.userId === thread.userId
    )

    if (existingIndex >= 0) {
      threads.value.splice(existingIndex, 1, thread)
    } else {
      threads.value.push(thread)
    }

    threads.value = sortThreadsByDate(threads.value)
  }

  function previewFromMessage(message?: BygMessage): string {
    if (!message) return 'No chats yet.'

    const content = message.content.trim()
    if (content) {
      return content.length <= 80 ? content : `${content.slice(0, 80)}…`
    }

    if (message.sharedPost) return 'Shared a post'
    if (message.sharedImage) return 'Shared an image'
    return 'Sent a chat'
  }

  function upsertThreadFromMessage(message: BygMessage): void {
    const currentUserId = auth.user?.id
    if (!currentUserId) return

    const counterpart =
      message.senderId === currentUserId
        ? {
            userId: message.recipientId,
            username: message.recipientUsername,
            avatarUrl: message.recipientAvatarUrl,
            subscriptionState: message.recipientSubscriptionState,
          }
        : {
            userId: message.senderId,
            username: message.senderUsername,
            avatarUrl: message.senderAvatarUrl,
            subscriptionState: message.senderSubscriptionState,
          }

    const previewContent = previewFromMessage(message)

    upsertThread({
      userId: counterpart.userId,
      username: counterpart.username,
      avatarUrl: counterpart.avatarUrl,
      subscriptionState: counterpart.subscriptionState,
      lastMessagePreview:
        previewContent.length <= 80
          ? previewContent
          : `${previewContent.slice(0, 80)}…`,
      lastMessageDate: message.createdDate,
    })
  }

  function isMessageInSelectedThread(message: BygMessage): boolean {
    const currentUserId = auth.user?.id
    const activeThread = selectedThread.value
    if (!currentUserId || !activeThread) return false

    return (
      (message.senderId === currentUserId &&
        message.recipientId === activeThread.userId) ||
      (message.senderId === activeThread.userId &&
        message.recipientId === currentUserId)
    )
  }

  async function scrollConversationToBottom(): Promise<void> {
    await nextTick()

    if (!conversationScroller.value) return
    conversationScroller.value.scrollTop =
      conversationScroller.value.scrollHeight
  }

  async function loadThreads(options: { force?: boolean } = {}): Promise<void> {
    loadingThreads.value = true
    try {
      const loadedThreads = await fetchMessageThreads(options)
      threads.value = sortThreadsByDate(loadedThreads)
    } catch {
      error.value = 'Failed to load chat threads.'
    } finally {
      loadingThreads.value = false
    }
  }

  async function loadConversation(
    username: string,
    options: { force?: boolean } = {}
  ): Promise<void> {
    const activeUsername = normalizeUsername(username)
    if (!activeUsername) return

    loadingConversation.value = true
    error.value = null

    try {
      const conversation = await fetchMessageConversation(
        activeUsername,
        options
      )

      if (!conversation) {
        messages.value = []
        return
      }

      selectedThread.value = {
        userId: conversation.userId,
        username: conversation.username,
        avatarUrl: conversation.avatarUrl,
        subscriptionState: conversation.subscriptionState,
        lastMessagePreview: previewFromMessage(
          conversation.messages[conversation.messages.length - 1]
        ),
        lastMessageDate:
          conversation.messages[conversation.messages.length - 1]
            ?.createdDate ?? new Date().toISOString(),
      }
      upsertThread(selectedThread.value)

      messages.value = conversation.messages
      await scrollConversationToBottom()
    } catch {
      error.value = 'Failed to load conversation.'
    } finally {
      loadingConversation.value = false
    }
  }

  async function pickThread(
    thread: BygMessageThread,
    options: {
      force?: boolean
      syncQuery?: boolean
    } = {}
  ): Promise<void> {
    selectedThread.value = thread

    if (options.syncQuery !== false) {
      const nextLocation = {
        name: 'messages',
        query: {
          ...route.query,
          with: thread.username,
        },
      }

      if (isMobileViewport.value) {
        await router.push(nextLocation)
      } else {
        await router.replace(nextLocation)
      }
    }

    await loadConversation(thread.username, {
      force: options.force,
    })
  }

  async function closeMobileConversation(): Promise<void> {
    if (!isMobileConversationView.value) return

    stopTypingSignal()

    await router.push({ name: 'messages' })
  }

  function pickThreadFromConversation(
    conversation: BygMessageConversation
  ): void {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    upsertThread({
      userId: conversation.userId,
      username: conversation.username,
      avatarUrl: conversation.avatarUrl,
      subscriptionState: conversation.subscriptionState,
      lastMessagePreview: previewFromMessage(lastMessage),
      lastMessageDate: lastMessage?.createdDate ?? new Date().toISOString(),
    })
  }

  async function chooseStarterSuggestion(username: string): Promise<void> {
    const pickedSuggestion = starterSuggestions.value.find(
      suggestion =>
        normalizeUsername(suggestion.username) === normalizeUsername(username)
    )

    clearStarterSuggestions()
    starterQuery.value = ''

    if (!pickedSuggestion) return

    const existingThread = threads.value.find(
      thread =>
        normalizeUsername(thread.username) ===
        normalizeUsername(pickedSuggestion.username)
    )

    if (existingThread) {
      await pickThread(existingThread, {
        syncQuery: true,
      })
      return
    }

    const optimisticThread: BygMessageThread = {
      userId: pickedSuggestion.id,
      username: pickedSuggestion.username,
      avatarUrl: pickedSuggestion.avatarUrl,
      subscriptionState: pickedSuggestion.subscriptionState,
      lastMessagePreview: 'No chats yet.',
      lastMessageDate: new Date().toISOString(),
    }
    upsertThread(optimisticThread)
    await pickThread(optimisticThread, {
      force: true,
      syncQuery: true,
    })
  }

  function clearTypingIndicators(): void {
    typingByUserId.value = {}
    typingClearTimers.forEach(timer => window.clearTimeout(timer))
    typingClearTimers.clear()
  }

  function markThreadTyping(userId: number, isTyping: boolean): void {
    typingByUserId.value = {
      ...typingByUserId.value,
      [userId]: isTyping,
    }
  }

  function handleLiveEvent(event: BygMessageLiveServerEvent): void {
    switch (event.type) {
      case 'auth:ok':
        connectedLive.value = true
        return

      case 'auth:error':
        connectedLive.value = false
        return

      case 'typing': {
        markThreadTyping(event.fromUserId, event.isTyping)

        const existingTimer = typingClearTimers.get(event.fromUserId)
        if (existingTimer) {
          window.clearTimeout(existingTimer)
          typingClearTimers.delete(event.fromUserId)
        }

        if (event.isTyping) {
          const timeoutId = window.setTimeout(() => {
            markThreadTyping(event.fromUserId, false)
            typingClearTimers.delete(event.fromUserId)
          }, 1800)
          typingClearTimers.set(event.fromUserId, timeoutId)
        }

        return
      }

      case 'message:new': {
        upsertThreadFromMessage(event.message)

        if (isMessageInSelectedThread(event.message)) {
          if (
            !messages.value.some(existing => existing.id === event.message.id)
          ) {
            messages.value = [ ...messages.value, event.message ]
            scrollConversationToBottom()
          }
          markThreadTyping(event.message.senderId, false)
        }

        return
      }

      case 'auth:required':
      case 'error':
      default:
        return
    }
  }

  function scheduleSocketReconnect(): void {
    if (!allowSocketReconnect || reconnectTimer) return

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = undefined
      connectLiveSocket()
    }, 1500)
  }

  function connectLiveSocket(): void {
    if (!auth.token) return

    liveSocket.value?.close()

    const socket = createMessagesSocket(
      event => {
        handleLiveEvent(event)
      },
      connected => {
        connectedLive.value = connected
      }
    )
    liveSocket.value = socket

    if (!socket) return

    socket.addEventListener('close', scheduleSocketReconnect)
    socket.addEventListener('error', scheduleSocketReconnect)
  }

  function stopTypingSignal(): void {
    if (!selectedThread.value || !sentTypingState) return

    sendTypingEvent(liveSocket.value, selectedThread.value.userId, false)
    sentTypingState = false
  }

  function onComposerInput(): void {
    if (!selectedThread.value) return

    if (!sentTypingState) {
      sendTypingEvent(liveSocket.value, selectedThread.value.userId, true)
      sentTypingState = true
    }

    if (typingStopTimer) {
      window.clearTimeout(typingStopTimer)
    }

    typingStopTimer = window.setTimeout(() => {
      stopTypingSignal()
      typingStopTimer = undefined
    }, 1200)
  }

  async function sendCurrentMessage(): Promise<void> {
    if (!selectedThread.value || sendingMessage.value) return

    const content = composerText.value.trim()
    if (!content) return

    sendingMessage.value = true
    error.value = null

    const sent = await sendMessage({
      recipientId: selectedThread.value.userId,
      content,
    })

    sendingMessage.value = false

    if (!sent) {
      error.value = 'Failed to send message.'
      return
    }

    composerText.value = ''
    stopTypingSignal()
    upsertThreadFromMessage(sent)

    if (!messages.value.some(message => message.id === sent.id)) {
      messages.value = [ ...messages.value, sent ]
      await scrollConversationToBottom()
    }
  }

  async function hydrateInitialThread(): Promise<void> {
    const targetUsername =
      typeof route.query.with === 'string'
        ? route.query.with
        : isMobileViewport.value
          ? undefined
          : threads.value[0]?.username

    if (!targetUsername) return

    const existingThread = threads.value.find(
      thread =>
        normalizeUsername(thread.username) === normalizeUsername(targetUsername)
    )

    if (existingThread) {
      await pickThread(existingThread, {
        syncQuery: false,
      })
      return
    }

    const directConversation = await fetchMessageConversation(targetUsername, {
      force: true,
    })
    if (!directConversation) return

    pickThreadFromConversation(directConversation)

    const loadedThread = threads.value.find(
      thread =>
        normalizeUsername(thread.username) ===
        normalizeUsername(directConversation.username)
    )
    if (loadedThread) {
      await pickThread(loadedThread, {
        syncQuery: false,
      })
    }
  }

  onMounted(async () => {
    mainEl = document.querySelector('main')
    if (mainEl) {
      savedOverflowY = mainEl.style.overflowY
      mainEl.style.overflowY = 'hidden'
    }

    mobileMediaQuery.addEventListener('change', onMobileMediaChange)

    await loadThreads()
    await hydrateInitialThread()
    connectLiveSocket()
  })

  onUnmounted(() => {
    allowSocketReconnect = false
    stopTypingSignal()
    clearTypingIndicators()

    if (typingStopTimer) {
      window.clearTimeout(typingStopTimer)
      typingStopTimer = undefined
    }

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer)
      reconnectTimer = undefined
    }

    liveSocket.value?.close()
    liveSocket.value = null

    mobileMediaQuery.removeEventListener('change', onMobileMediaChange)

    if (mainEl) {
      mainEl.style.overflowY = savedOverflowY
      mainEl = null
    }
  })

  watch(
    () => route.query.with,
    async nextWith => {
      if (typeof nextWith !== 'string') return
      if (
        selectedThread.value &&
        normalizeUsername(selectedThread.value.username) ===
          normalizeUsername(nextWith)
      ) {
        return
      }

      const matchingThread = threads.value.find(
        thread =>
          normalizeUsername(thread.username) === normalizeUsername(nextWith)
      )
      if (matchingThread) {
        await pickThread(matchingThread, {
          syncQuery: false,
        })
        return
      }

      const loadedConversation = await fetchMessageConversation(nextWith, {
        force: true,
      })
      if (!loadedConversation) return

      pickThreadFromConversation(loadedConversation)
      const loadedThread = threads.value.find(
        thread =>
          normalizeUsername(thread.username) === normalizeUsername(nextWith)
      )
      if (loadedThread) {
        await pickThread(loadedThread, {
          syncQuery: false,
        })
      }
    }
  )
</script>

<template>
  <ContentArea class="messagesPage" hide-terms-link>
    <HStack class="messagesLayout">
      <aside
        class="threadsPane"
        v-if="shouldShowThreadsPane"
        :class="{ only: !shouldShowConversationPane }"
      >
        <header class="threadsHeader">
          <h3>Chats</h3>

          <button
            class="refreshThreadsButton"
            :disabled="loadingThreads"
            @click="loadThreads({ force: true })"
          >
            <Icon icon="solar:refresh-line-duotone" />
          </button>
        </header>

        <div class="starterBox">
          <input
            v-model="starterQuery"
            class="starterInput"
            placeholder="Start chat with @username"
            @input="updateStarterSuggestions"
            @focus="updateStarterSuggestions"
          />

          <MentionSuggestions
            v-if="showingStarterSuggestions"
            :suggestions="starterSuggestions"
            @select="chooseStarterSuggestion"
          />
        </div>

        <div class="threadsContent">
          <p v-if="loadingThreads" class="light threadState">
            Loading chats...
          </p>
          <p v-else-if="threads.length < 1" class="light threadState">
            No messages yet. Start a conversation above.
          </p>

          <div class="threadList" v-else>
            <MessageThreadItem
              v-for="thread in threads"
              :key="thread.userId"
              :thread="thread"
              :selected="selectedThread?.userId === thread.userId"
              :typing="typingByUserId[thread.userId]"
              @select="pickThread(thread)"
            />
          </div>
        </div>
      </aside>

      <section class="conversationPane" v-if="shouldShowConversationPane">
        <header class="conversationHeader">
          <HStack class="conversationTitleWrap">
            <button
              class="mobileBackButton"
              v-if="isMobileConversationView"
              @click="closeMobileConversation()"
            >
              <Icon icon="solar:arrow-left-line-duotone" />
            </button>

            <div class="conversationTitle">
              <h3 v-if="selectedThread">@{{ selectedThread.username }}</h3>
              <h3 v-else>Select a chat</h3>
              <p
                class="light"
                v-if="selectedThread && typingByUserId[selectedThread.userId]"
              >
                Typing...
              </p>
            </div>
          </HStack>

          <div class="connectionState">
            <Icon
              :icon="
                connectedLive
                  ? 'solar:cloud-check-line-duotone'
                  : 'solar:cloud-cross-line-duotone'
              "
            />
            <p class="light">{{ connectedLive ? 'Live' : 'Offline' }}</p>
          </div>
        </header>

        <ErrorState v-if="error" :message="error" />

        <div
          class="conversationEmpty"
          v-else-if="!selectedThread && !loadingConversation"
        >
          <Icon icon="solar:chat-round-line-line-duotone" />
          <h3>Choose a chat to start messaging.</h3>
        </div>

        <div class="conversationBody" v-else>
          <p v-if="loadingConversation" class="light loadingConversationText">
            Loading conversation...
          </p>

          <div ref="conversationScroller" class="messageList">
            <MessageBubble
              v-for="message in messages"
              :key="message.id"
              :message="message"
              :outgoing="message.senderId === auth.user?.id"
            />
          </div>

          <div class="composer" @click.stop>
            <textarea
              v-model="composerText"
              class="composerInput"
              placeholder="Type a message..."
              :disabled="!selectedThread || sendingMessage"
              @input="onComposerInput"
              @blur="stopTypingSignal"
              @keydown.enter.exact.prevent="sendCurrentMessage"
            />

            <button
              class="prominent sendButton"
              :disabled="
                !selectedThread || sendingMessage || !composerText.trim()
              "
              @click="sendCurrentMessage"
            >
              <Icon icon="solar:plain-line-duotone" />
              Send
            </button>
          </div>
        </div>
      </section>
    </HStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/variables"

  .messagesLayout
    width: 100%
    height: calc(100vh - 7rem)
    align-items: stretch
    flex-wrap: nowrap
    gap: 0.75rem

    .threadsPane
      min-width: 20rem
      display: flex
      flex-direction: column
      gap: 1rem

      &.only
        width: 100%

      .starterInput
        width: calc(100% - 1.5rem)
        padding: 0.75rem
        border-radius: 1rem

      .threadList, .threadsHeader
        width: 100%

      .threadList
        flex: 1 1 auto
        min-height: 0
        overflow: auto
        display: flex
        flex-direction: column
        gap: 0.5rem

      .threadsHeader
        display: flex
        justify-content: space-between

      .threadsContent
        flex: 1 1 auto
        min-height: 0
        display: flex
        flex-direction: column

    .conversationPane
      height: 100%
      width: 100%
      display: flex
      flex-direction: column
      min-height: 0

      .conversationHeader
        gap: 0.5rem

        .conversationTitleWrap
          align-items: flex-start

        .connectionState
          flex-direction: row
          gap: 0.25rem

      .conversationBody
        display: flex
        flex-direction: column
        flex: 1 1 auto
        min-height: 0
        width: 100%
        gap: 0.75rem

        .messageList
          flex: 1 1 auto
          min-height: 0
          overflow: auto
          width: 100%
          border-radius: 0

        .composer
          flex-direction: row
          gap: 1rem
          width: 100%

          textarea
            height: 2rem
            resize: vertical
            border-radius: 1rem
            flex-grow: 1

  @media (max-width: variables.$mobileWidth)
    .messagesLayout
      height: calc(100vh - 7rem - 3.5rem)
      padding-top: 1rem
</style>

<style lang="sass">
  .bygMobileNav > .createButton
    display: none
</style>
