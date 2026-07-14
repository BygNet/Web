<script setup lang="ts">
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    watch,
    watchEffect,
    type WatchStopHandle,
  } from 'vue'

  import { useRoute } from '#app'

  definePageMeta({
    layout: 'plain',
    middleware: 'auth',
  })

  import { useI18n } from 'vue-i18n'

  import { auth } from '@/auth/session'
  import SafeLink from '@/components/base/SafeLink.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import MessageBubble from '@/components/messages/MessageBubble.vue'
  import MessageThreadItem from '@/components/messages/MessageThreadItem.vue'
  import MentionSuggestions from '@/components/posts/MentionSuggestions.vue'
  import { fetchUserSuggestions } from '@/data/mentions'
  import {
    createGroupConversation,
    createMessagesSocket,
    fetchMessageConversation,
    fetchMessageConversationById,
    fetchMessageThreads,
    getOrCreateDirectConversation,
    inviteGroupConversationMember,
    removeGroupConversationMember,
    sendMessage,
    sendTypingEvent,
    updateGroupConversationInfo,
  } from '@/data/messages'
  import { PageMetaByPath } from '@/data/pages'
  import { title } from '@/data/title'
  import type { BygUserSuggestion } from '@/types/mentions'
  import type {
    BygMessage,
    BygMessageConversation,
    BygMessageConversationMember,
    BygMessageLiveServerEvent,
    BygMessageThread,
  } from '@/types/messages'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'

  const { t } = useI18n()
  const localePath = useLocalePath()
  const pageMeta = PageMetaByPath['/messages']!

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })
  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })

  const route = useRoute()

  const loadingThreads: Ref<boolean> = ref(true)
  const loadingConversation: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const threads: Ref<BygMessageThread[]> = ref([])
  const selectedThread: Ref<BygMessageThread | null> = ref(null)
  const messages: Ref<BygMessage[]> = ref([])
  const outgoingDeliveryByMessageId: Ref<Record<number, MessageDeliveryState>> =
    ref({})
  const composerText: Ref<string> = ref('')
  const sendingMessage: Ref<boolean> = ref(false)
  const connectedLive: Ref<boolean> = ref(false)
  const typingByUserId: Ref<Record<number, boolean>> = ref({})
  const showingGroupCreateModal: Ref<boolean> = ref(false)
  const showingGroupInfoModal: Ref<boolean> = ref(false)
  const groupInfoThread: Ref<BygMessageThread | null> = ref(null)
  const groupTitleInput: Ref<string> = ref('')
  const groupImageUrlInput: Ref<string> = ref('')
  const groupDescriptionInput: Ref<string> = ref('')
  const groupMemberQuery: Ref<string> = ref('')
  const groupMemberSuggestions: Ref<BygUserSuggestion[]> = ref([])
  const selectedGroupMemberIds: Ref<number[]> = ref([])
  const selectedGroupMemberDrafts: Ref<BygUserSuggestion[]> = ref([])
  const groupStatusMessage: Ref<string | null> = ref(null)
  const savingGroup: Ref<boolean> = ref(false)

  type MessageDeliveryState = 'sending' | 'sent'
  type MessageGroupPosition = 'single' | 'top' | 'middle' | 'bottom'
  type ConversationTimestampEntry = {
    type: 'timestamp'
    key: string
    label: string
  }
  type ConversationMessageEntry = {
    type: 'message'
    key: string
    message: BygMessage
    outgoing: boolean
    showAvatar: boolean
    showSenderName: boolean
    groupPosition: MessageGroupPosition
    deliveryState: MessageDeliveryState | null
  }
  type ConversationEntry = ConversationTimestampEntry | ConversationMessageEntry
  const CONTINUATION_GAP_MS = 3 * 60 * 60 * 1000

  const starterQuery: Ref<string> = ref('')
  const starterSuggestions: Ref<BygUserSuggestion[]> = ref([])
  const showingStarterSuggestions: Ref<boolean> = ref(false)
  let starterSuggestionRequestId = 0
  let groupSuggestionRequestId = 0

  const conversationScroller: Ref<HTMLDivElement | null> = ref(null)
  const composerInput: Ref<HTMLTextAreaElement | null> = ref(null)
  const isMobileViewport: Ref<boolean> = ref(false)
  const liveSocket: Ref<WebSocket | null> = ref(null)
  let reconnectTimer: number | undefined
  let typingStopTimer: number | undefined
  const typingClearTimers = new Map<number, number>()
  let sentTypingState = false
  let typingTargetUserId: number | null = null
  let nextOptimisticMessageId = -1
  let allowSocketReconnect = true
  let mainEl: HTMLElement | null = null
  let stopNavigationEnforcement: WatchStopHandle | null = null
  let mobileMediaQuery: MediaQueryList | null = null
  const MAIN_SCROLL_LOCK_COUNT_ATTR = 'data-messages-scroll-lock-count'
  const MAIN_SCROLL_LOCK_ORIGINAL_ATTR = 'data-messages-original-overflow-y'

  if (import.meta.client) {
    mobileMediaQuery = window.matchMedia('(max-width: 50rem)')
    isMobileViewport.value = mobileMediaQuery.matches
  }

  function onMobileMediaChange(event: MediaQueryListEvent): void {
    isMobileViewport.value = event.matches
  }

  function lockMainScroll(): void {
    mainEl = document.querySelector('main')
    if (!mainEl) return

    const currentCountRaw = mainEl.getAttribute(MAIN_SCROLL_LOCK_COUNT_ATTR)
    const currentCount = Number(currentCountRaw ?? '0')
    const safeCurrentCount = Number.isFinite(currentCount)
      ? Math.max(0, Math.trunc(currentCount))
      : 0

    if (safeCurrentCount === 0) {
      mainEl.setAttribute(
        MAIN_SCROLL_LOCK_ORIGINAL_ATTR,
        mainEl.style.overflowY
      )
    }

    mainEl.setAttribute(
      MAIN_SCROLL_LOCK_COUNT_ATTR,
      String(safeCurrentCount + 1)
    )
    mainEl.style.overflowY = 'hidden'
  }

  function unlockMainScroll(): void {
    if (!mainEl) return

    const currentCountRaw = mainEl.getAttribute(MAIN_SCROLL_LOCK_COUNT_ATTR)
    const currentCount = Number(currentCountRaw ?? '0')
    const safeCurrentCount = Number.isFinite(currentCount)
      ? Math.max(0, Math.trunc(currentCount))
      : 0

    if (safeCurrentCount <= 1) {
      const originalOverflow =
        mainEl.getAttribute(MAIN_SCROLL_LOCK_ORIGINAL_ATTR) ?? ''
      mainEl.style.overflowY = originalOverflow
      mainEl.removeAttribute(MAIN_SCROLL_LOCK_COUNT_ATTR)
      mainEl.removeAttribute(MAIN_SCROLL_LOCK_ORIGINAL_ATTR)
    } else {
      mainEl.setAttribute(
        MAIN_SCROLL_LOCK_COUNT_ATTR,
        String(safeCurrentCount - 1)
      )
    }

    mainEl = null
  }

  const isMobileConversationView = computed(() => {
    const hasConversation =
      typeof route.query.conversation === 'string' &&
      route.query.conversation.trim().length > 0
    const hasDirect =
      typeof route.query.with === 'string' && route.query.with.trim().length > 0

    return isMobileViewport.value && (hasConversation || hasDirect)
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

  function normalizeUserId(value: number): number | null {
    const normalized = Number(value)
    if (!Number.isFinite(normalized)) return null
    return Math.trunc(normalized)
  }

  function normalizeConversationId(value: unknown): number | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null
    const normalized = Number(value)
    if (!Number.isFinite(normalized)) return null
    return Math.trunc(normalized)
  }

  function getDirectMember(
    thread: Pick<BygMessageThread, 'type' | 'members'>
  ): BygMessageConversationMember | null {
    if (thread.type !== 'direct') return null
    return (
      thread.members.find(member => member.userId !== auth.user?.id) ?? null
    )
  }

  function getThreadDisplayName(
    thread: Pick<BygMessageThread, 'type' | 'title' | 'name' | 'members'>
  ): string {
    if (thread.type === 'group') {
      return thread.title ?? t('ui.messages.groupChatFallback')
    }

    return (
      getDirectMember(thread)?.username ?? t('ui.messages.directChatFallback')
    )
  }

  function getThreadAvatarUrl(
    thread: Pick<BygMessageThread, 'type' | 'imageUrl' | 'members'>
  ): string | null {
    if (thread.type === 'group') {
      return thread.imageUrl ?? null
    }

    return getDirectMember(thread)?.avatarUrl ?? null
  }

  function getThreadTypingUserId(thread: BygMessageThread): number | null {
    return thread.type === 'direct'
      ? (getDirectMember(thread)?.userId ?? null)
      : null
  }

  function threadFromConversation(
    conversation: BygMessageConversation
  ): BygMessageThread {
    const lastMessage = conversation.messages[conversation.messages.length - 1]

    return {
      conversationId: conversation.conversationId,
      type: conversation.type,
      name: conversation.name,
      title: conversation.title,
      imageUrl: conversation.imageUrl,
      description: conversation.description,
      creatorId: conversation.creatorId,
      members: conversation.members,
      lastMessagePreview: previewFromMessage(lastMessage),
      lastMessageDate: lastMessage?.createdDate ?? new Date().toISOString(),
    }
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
      existing => existing.conversationId === thread.conversationId
    )

    if (existingIndex >= 0) {
      threads.value.splice(existingIndex, 1, thread)
    } else {
      threads.value.push(thread)
    }

    threads.value = sortThreadsByDate(threads.value)
  }

  function previewFromMessage(message?: BygMessage): string {
    if (!message) return t('ui.chat.previewNoChats')

    const content = message.content.trim()
    if (content) {
      return content.length <= 80 ? content : `${content.slice(0, 80)}…`
    }

    if (message.sharedPost) return t('ui.chat.previewSharedPost')
    if (message.sharedImage) return t('ui.chat.previewSharedImage')
    return t('ui.chat.previewSentChat')
  }

  function upsertThreadFromMessage(message: BygMessage): void {
    const existingThread = threads.value.find(
      thread => thread.conversationId === message.conversationId
    )
    if (!existingThread) {
      loadThreads({ force: true })
      return
    }

    upsertThread({
      ...existingThread,
      lastMessagePreview: previewFromMessage(message),
      lastMessageDate: message.createdDate,
    })
  }

  function isMessageInSelectedThread(message: BygMessage): boolean {
    const currentUserId = auth.user?.id
    const activeThread = selectedThread.value
    if (!currentUserId || !activeThread) return false

    return message.conversationId === activeThread.conversationId
  }

  function setOutgoingDeliveryState(
    messageId: number,
    state: MessageDeliveryState | null,
    options: {
      exclusive?: boolean
    } = {}
  ): void {
    const nextState = options.exclusive
      ? {}
      : {
          ...outgoingDeliveryByMessageId.value,
        }

    if (!state) {
      delete nextState[messageId]
    } else {
      nextState[messageId] = state
    }

    outgoingDeliveryByMessageId.value = nextState
  }

  function resetOutgoingDeliveryState(): void {
    outgoingDeliveryByMessageId.value = {}
  }

  function parseMessageTimestamp(input: string): number | null {
    const parsed = new Date(input).getTime()
    return Number.isFinite(parsed) ? parsed : null
  }

  function hasLongGap(previous: BygMessage, current: BygMessage): boolean {
    const previousTime = parseMessageTimestamp(previous.createdDate)
    const currentTime = parseMessageTimestamp(current.createdDate)
    if (previousTime === null || currentTime === null) return false
    return currentTime - previousTime >= CONTINUATION_GAP_MS
  }

  function formatConversationTimestamp(input: string): string {
    const date = new Date(input)
    if (Number.isNaN(date.getTime())) return input

    const now = new Date()
    const shouldIncludeYear = date.getFullYear() !== now.getFullYear()

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      ...(shouldIncludeYear ? { year: 'numeric' as const } : {}),
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  function removeMessageById(messageId: number): void {
    messages.value = messages.value.filter(message => message.id !== messageId)
    setOutgoingDeliveryState(messageId, null)
  }

  function findMatchingOptimisticIndex(confirmed: BygMessage): number {
    for (let index = messages.value.length - 1; index >= 0; index -= 1) {
      const candidate = messages.value[index]
      if (!candidate || candidate.id >= 0) continue
      if (candidate.senderId !== confirmed.senderId) continue
      if (candidate.conversationId !== confirmed.conversationId) continue
      if (candidate.content !== confirmed.content) continue

      const candidateTime = parseMessageTimestamp(candidate.createdDate)
      const confirmedTime = parseMessageTimestamp(confirmed.createdDate)
      if (candidateTime !== null && confirmedTime !== null) {
        if (Math.abs(candidateTime - confirmedTime) > 45_000) {
          continue
        }
      }

      return index
    }

    return -1
  }

  function upsertConversationMessage(
    incomingMessage: BygMessage,
    options: {
      markOutgoingSent?: boolean
    } = {}
  ): boolean {
    const currentUserId = auth.user?.id
    const shouldMarkOutgoingSent =
      options.markOutgoingSent && currentUserId === incomingMessage.senderId

    const existingIndex = messages.value.findIndex(
      existingMessage => existingMessage.id === incomingMessage.id
    )
    if (existingIndex >= 0) {
      messages.value.splice(existingIndex, 1, incomingMessage)
      if (shouldMarkOutgoingSent) {
        setOutgoingDeliveryState(incomingMessage.id, 'sent', {
          exclusive: true,
        })
      }
      return false
    }

    const optimisticIndex = findMatchingOptimisticIndex(incomingMessage)
    if (optimisticIndex >= 0) {
      const optimisticMessage = messages.value[optimisticIndex]
      messages.value.splice(optimisticIndex, 1, incomingMessage)
      if (optimisticMessage) {
        setOutgoingDeliveryState(optimisticMessage.id, null)
      }
      setOutgoingDeliveryState(incomingMessage.id, 'sent', {
        exclusive: true,
      })
      return false
    }

    messages.value = [ ...messages.value, incomingMessage ]
    if (shouldMarkOutgoingSent) {
      setOutgoingDeliveryState(incomingMessage.id, 'sent', {
        exclusive: true,
      })
    }
    return true
  }

  function buildOptimisticOutgoingMessage(
    content: string,
    thread: BygMessageThread
  ): BygMessage | null {
    if (!auth.user) return null

    let senderSubscriptionState: BygMessage['senderSubscriptionState'] = 'free'
    let senderAvatarUrl: string | null = null

    for (let index = messages.value.length - 1; index >= 0; index -= 1) {
      const message = messages.value[index]
      if (!message) continue
      if (message.senderId !== auth.user.id) continue

      senderSubscriptionState = message.senderSubscriptionState
      senderAvatarUrl = message.senderAvatarUrl
      break
    }

    const directMember = getDirectMember(thread)
    const optimisticMessage: BygMessage = {
      id: nextOptimisticMessageId,
      conversationId: thread.conversationId,
      senderId: auth.user.id,
      senderUsername: auth.user.username,
      senderAvatarUrl,
      senderSubscriptionState,
      recipientId: directMember?.userId ?? null,
      recipientUsername: directMember?.username ?? 'unknown',
      recipientAvatarUrl: directMember?.avatarUrl ?? null,
      recipientSubscriptionState: directMember?.subscriptionState ?? 'free',
      content,
      createdDate: new Date().toISOString(),
      sharedPost: null,
      sharedImage: null,
    }
    nextOptimisticMessageId -= 1
    return optimisticMessage
  }

  const conversationEntries = computed<ConversationEntry[]>(() => {
    const renderedEntries: ConversationEntry[] = []
    const currentUserId = auth.user?.id

    for (let index = 0; index < messages.value.length; index += 1) {
      const message = messages.value[index]
      if (!message) continue

      const previousMessage = messages.value[index - 1]
      const nextMessage = messages.value[index + 1]

      const separatedFromPrevious =
        !!previousMessage && hasLongGap(previousMessage, message)
      const groupedWithPrevious =
        !!previousMessage &&
        !separatedFromPrevious &&
        previousMessage.senderId === message.senderId
      const groupedWithNext =
        !!nextMessage &&
        !hasLongGap(message, nextMessage) &&
        nextMessage.senderId === message.senderId

      if (separatedFromPrevious) {
        renderedEntries.push({
          type: 'timestamp',
          key: `time-${previousMessage.id}-${message.id}`,
          label: formatConversationTimestamp(message.createdDate),
        })
      }

      let groupPosition: MessageGroupPosition = 'single'
      if (!groupedWithPrevious && groupedWithNext) {
        groupPosition = 'top'
      } else if (groupedWithPrevious && groupedWithNext) {
        groupPosition = 'middle'
      } else if (groupedWithPrevious) {
        groupPosition = 'bottom'
      }

      const outgoing = message.senderId === currentUserId

      renderedEntries.push({
        type: 'message',
        key: `message-${message.id}`,
        message,
        outgoing,
        showAvatar: !outgoing && !groupedWithNext,
        showSenderName:
          selectedThread.value?.type === 'group' &&
          !outgoing &&
          !groupedWithPrevious,
        groupPosition,
        deliveryState: outgoing
          ? (outgoingDeliveryByMessageId.value[message.id] ?? null)
          : null,
      })
    }

    return renderedEntries
  })

  async function scrollConversationToBottom(): Promise<void> {
    await nextTick()

    if (!conversationScroller.value) return
    conversationScroller.value.scrollTop =
      conversationScroller.value.scrollHeight
  }

  function resizeComposerInput(): void {
    if (!composerInput.value) return

    composerInput.value.style.height = 'auto'
    const nextHeight = Math.min(
      Math.max(composerInput.value.scrollHeight, 40),
      160
    )
    composerInput.value.style.height = `${nextHeight}px`
  }

  function focusComposerInput(): void {
    if (!selectedThread.value || !composerInput.value) return
    composerInput.value.focus({ preventScroll: true })
  }

  async function loadThreads(options: { force?: boolean } = {}): Promise<void> {
    loadingThreads.value = true
    let loadedInitialData = false
    try {
      const loadedThreads = await fetchMessageThreads(options)
      threads.value = sortThreadsByDate(loadedThreads)
      loadedInitialData = true

      if (!options.force) {
        try {
          const refreshedThreads = await fetchMessageThreads({ force: true })
          threads.value = sortThreadsByDate(refreshedThreads)
        } catch {
          if (!loadedInitialData) {
            throw new Error('thread_refresh_failed')
          }
        }
      }
    } catch {
      error.value = t('ui.chat.errorLoadThreads')
    } finally {
      loadingThreads.value = false
    }
  }

  async function applyConversationSnapshot(
    conversation: BygMessageConversation
  ): Promise<void> {
    selectedThread.value = threadFromConversation(conversation)
    upsertThread(selectedThread.value)

    messages.value = conversation.messages
    resetOutgoingDeliveryState()
    await scrollConversationToBottom()
  }

  async function loadConversationByThread(
    thread: BygMessageThread,
    options: { force?: boolean } = {}
  ): Promise<void> {
    const activeConversationId = thread.conversationId

    loadingConversation.value = true
    error.value = null
    let loadedInitialConversation = false

    try {
      const conversation =
        activeConversationId > 0
          ? await fetchMessageConversationById(activeConversationId, options)
          : await fetchMessageConversation(
              getThreadDisplayName(thread),
              options
            )

      if (!conversation) {
        messages.value = []
        resetOutgoingDeliveryState()
        return
      }

      if (
        selectedThread.value &&
        selectedThread.value.conversationId !== activeConversationId
      ) {
        return
      }

      await applyConversationSnapshot(conversation)
      loadedInitialConversation = true

      if (!options.force) {
        try {
          const refreshedConversation =
            activeConversationId > 0
              ? await fetchMessageConversationById(activeConversationId, {
                  force: true,
                })
              : await fetchMessageConversation(getThreadDisplayName(thread), {
                  force: true,
                })
          if (!refreshedConversation) return
          if (
            selectedThread.value &&
            selectedThread.value.conversationId !== activeConversationId
          ) {
            return
          }

          await applyConversationSnapshot(refreshedConversation)
        } catch {
          if (!loadedInitialConversation) {
            throw new Error('conversation_refresh_failed')
          }
        }
      }
    } catch {
      error.value = t('ui.chat.errorLoadConversation')
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
    const isSwitchingThread =
      selectedThread.value?.conversationId !== thread.conversationId
    if (
      selectedThread.value &&
      selectedThread.value.conversationId !== thread.conversationId &&
      sentTypingState
    ) {
      stopTypingSignal()
    }

    selectedThread.value = thread
    if (isSwitchingThread) {
      messages.value = []
      resetOutgoingDeliveryState()
    }

    if (options.syncQuery !== false) {
      if (isMobileViewport.value) {
        await navigateTo({
          path: '/messages',
          query: {
            ...route.query,
            conversation: String(thread.conversationId),
            with: undefined,
          },
        })
      } else {
        await navigateTo({
          path: '/messages',
          query: {
            ...route.query,
            conversation: String(thread.conversationId),
            with: undefined,
          },
        })
      }
    }

    await loadConversationByThread(thread, {
      force: options.force,
    })
    await nextTick()
    focusComposerInput()
  }

  async function closeMobileConversation(): Promise<void> {
    if (!isMobileConversationView.value) return

    stopTypingSignal()

    await navigateTo(localePath('/messages'))
  }

  function pickThreadFromConversation(
    conversation: BygMessageConversation
  ): void {
    upsertThread(threadFromConversation(conversation))
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
        thread.type === 'direct' &&
        normalizeUsername(getThreadDisplayName(thread)) ===
          normalizeUsername(pickedSuggestion.username)
    )

    if (existingThread) {
      await pickThread(existingThread, {
        syncQuery: true,
      })
      return
    }

    const conversation = await getOrCreateDirectConversation({
      recipientId: pickedSuggestion.id,
    })
    if (!conversation) {
      error.value = t('ui.chat.errorLoadConversation')
      return
    }

    const thread = threadFromConversation(conversation)
    upsertThread(thread)
    await pickThread(thread, {
      force: true,
      syncQuery: true,
    })
  }

  function resetGroupForm(): void {
    groupTitleInput.value = ''
    groupImageUrlInput.value = ''
    groupDescriptionInput.value = ''
    groupMemberQuery.value = ''
    groupMemberSuggestions.value = []
    selectedGroupMemberIds.value = []
    selectedGroupMemberDrafts.value = []
    groupStatusMessage.value = null
  }

  function openGroupCreateModal(): void {
    resetGroupForm()
    showingGroupCreateModal.value = true
  }

  function closeGroupCreateModal(): void {
    showingGroupCreateModal.value = false
    resetGroupForm()
  }

  function openGroupInfoModal(thread: BygMessageThread): void {
    if (thread.type !== 'group') return

    groupInfoThread.value = thread
    groupTitleInput.value = thread.title ?? ''
    groupImageUrlInput.value = thread.imageUrl ?? ''
    groupDescriptionInput.value = thread.description ?? ''
    groupMemberQuery.value = ''
    groupMemberSuggestions.value = []
    selectedGroupMemberIds.value = []
    groupStatusMessage.value = null
    showingGroupInfoModal.value = true
  }

  function closeGroupInfoModal(): void {
    showingGroupInfoModal.value = false
    groupInfoThread.value = null
    resetGroupForm()
  }

  function isSelectedGroupMember(userId: number): boolean {
    return selectedGroupMemberIds.value.includes(userId)
  }

  function addSelectedGroupMember(user: BygUserSuggestion): void {
    if (user.id === auth.user?.id || isSelectedGroupMember(user.id)) return

    selectedGroupMemberIds.value = [ ...selectedGroupMemberIds.value, user.id ]
    selectedGroupMemberDrafts.value = [ ...selectedGroupMemberDrafts.value, user ]
    groupMemberQuery.value = ''
    groupMemberSuggestions.value = []
  }

  function chooseGroupMemberSuggestion(username: string): void {
    const pickedSuggestion = groupMemberSuggestions.value.find(
      suggestion =>
        normalizeUsername(suggestion.username) === normalizeUsername(username)
    )
    if (!pickedSuggestion) return

    addSelectedGroupMember(pickedSuggestion)
  }

  function removeSelectedGroupMember(userId: number): void {
    selectedGroupMemberIds.value = selectedGroupMemberIds.value.filter(
      existingUserId => existingUserId !== userId
    )
    selectedGroupMemberDrafts.value = selectedGroupMemberDrafts.value.filter(
      user => user.id !== userId
    )
  }

  function getSelectedGroupMembers(): BygUserSuggestion[] {
    return selectedGroupMemberIds.value.map(userId => {
      const suggestedUser = selectedGroupMemberDrafts.value.find(
        user => user.id === userId
      )
      const existingMember = groupInfoThread.value?.members.find(
        member => member.userId === userId
      )

      return {
        id: userId,
        username:
          suggestedUser?.username ??
          existingMember?.username ??
          `user-${userId}`,
        avatarUrl:
          suggestedUser?.avatarUrl ?? existingMember?.avatarUrl ?? null,
        subscriptionState:
          suggestedUser?.subscriptionState ??
          existingMember?.subscriptionState ??
          'free',
      }
    })
  }

  async function updateGroupMemberSuggestions(): Promise<void> {
    const normalized = groupMemberQuery.value.trim().replace(/^@/, '')
    if (!normalized) {
      groupMemberSuggestions.value = []
      return
    }

    const requestId = ++groupSuggestionRequestId
    const suggestions = await fetchUserSuggestions(normalized)
    if (requestId !== groupSuggestionRequestId) return

    const existingMemberIds = new Set(
      groupInfoThread.value?.members.map(member => member.userId) ?? [
        auth.user?.id,
      ]
    )
    if (auth.user?.id) {
      existingMemberIds.add(auth.user.id)
    }

    groupMemberSuggestions.value = suggestions.filter(
      suggestion =>
        !existingMemberIds.has(suggestion.id) &&
        !selectedGroupMemberIds.value.includes(suggestion.id)
    )
  }

  async function createCurrentGroupConversation(): Promise<void> {
    if (savingGroup.value || selectedGroupMemberIds.value.length < 1) return

    savingGroup.value = true
    groupStatusMessage.value = null

    const conversation = await createGroupConversation({
      title: groupTitleInput.value.trim() || undefined,
      imageUrl: groupImageUrlInput.value.trim() || undefined,
      description: groupDescriptionInput.value.trim() || undefined,
      memberIds: selectedGroupMemberIds.value,
    })

    savingGroup.value = false

    if (!conversation) {
      groupStatusMessage.value = t('ui.messages.failedToCreateGroupChat')
      return
    }

    const thread = threadFromConversation(conversation)
    upsertThread(thread)
    closeGroupCreateModal()
    await pickThread(thread, {
      force: true,
      syncQuery: true,
    })
  }

  async function saveCurrentGroupInfo(): Promise<void> {
    const thread = groupInfoThread.value
    if (!thread || savingGroup.value) return

    savingGroup.value = true
    groupStatusMessage.value = null

    const conversation = await updateGroupConversationInfo(
      thread.conversationId,
      {
        title: groupTitleInput.value.trim() || null,
        imageUrl: groupImageUrlInput.value.trim() || null,
        description: groupDescriptionInput.value.trim() || null,
      }
    )

    savingGroup.value = false

    if (!conversation) {
      groupStatusMessage.value = t('ui.messages.failedToUpdateGroupChat')
      return
    }

    const updatedThread = threadFromConversation(conversation)
    groupInfoThread.value = updatedThread
    upsertThread(updatedThread)
    if (selectedThread.value?.conversationId === updatedThread.conversationId) {
      selectedThread.value = updatedThread
    }
    groupStatusMessage.value = t('ui.messages.groupChatUpdated')
  }

  async function inviteSelectedGroupMembers(): Promise<void> {
    const thread = groupInfoThread.value
    if (
      !thread ||
      savingGroup.value ||
      selectedGroupMemberIds.value.length < 1
    ) {
      return
    }

    savingGroup.value = true
    groupStatusMessage.value = null

    let latestConversation: BygMessageConversation | null = null
    for (const userId of selectedGroupMemberIds.value) {
      latestConversation = await inviteGroupConversationMember(
        thread.conversationId,
        { userId }
      )
      if (!latestConversation) break
    }

    savingGroup.value = false

    if (!latestConversation) {
      groupStatusMessage.value = t('ui.messages.failedToAddMember')
      return
    }

    const updatedThread = threadFromConversation(latestConversation)
    selectedGroupMemberIds.value = []
    selectedGroupMemberDrafts.value = []
    groupMemberSuggestions.value = []
    groupInfoThread.value = updatedThread
    upsertThread(updatedThread)
    if (selectedThread.value?.conversationId === updatedThread.conversationId) {
      selectedThread.value = updatedThread
    }
    groupStatusMessage.value = t('ui.messages.memberAdded')
  }

  async function removeExistingGroupMember(userId: number): Promise<void> {
    const thread = groupInfoThread.value
    if (!thread || savingGroup.value || userId === thread.creatorId) return

    savingGroup.value = true
    groupStatusMessage.value = null

    const conversation = await removeGroupConversationMember(
      thread.conversationId,
      userId
    )

    savingGroup.value = false

    if (!conversation) {
      groupStatusMessage.value = t('ui.messages.failedToRemoveMember')
      return
    }

    const updatedThread = threadFromConversation(conversation)
    groupInfoThread.value = updatedThread
    upsertThread(updatedThread)
    if (selectedThread.value?.conversationId === updatedThread.conversationId) {
      selectedThread.value = updatedThread
    }
    groupStatusMessage.value = t('ui.messages.memberRemoved')
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
        sentTypingState = false
        typingTargetUserId = null
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
          const addedNewMessage = upsertConversationMessage(event.message)
          if (addedNewMessage) {
            scrollConversationToBottom()
          }
          markThreadTyping(event.message.senderId, false)
        }

        return
      }

      case 'auth:required':
        connectedLive.value = false
        return
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
        if (!connected) {
          sentTypingState = false
          typingTargetUserId = null
        }
      }
    )
    liveSocket.value = socket

    if (!socket) return

    socket.addEventListener('close', scheduleSocketReconnect)
    socket.addEventListener('error', scheduleSocketReconnect)
  }

  function stopTypingSignal(): void {
    if (!sentTypingState || typingTargetUserId === null) return

    sendTypingEvent(liveSocket.value, typingTargetUserId, false)
    sentTypingState = false
    typingTargetUserId = null
  }

  function onComposerInput(): void {
    resizeComposerInput()

    if (!selectedThread.value) return
    if (!connectedLive.value) {
      sentTypingState = false
      typingTargetUserId = null
      return
    }

    if (selectedThread.value.type !== 'direct') return

    const recipientId = normalizeUserId(
      getDirectMember(selectedThread.value)?.userId ?? NaN
    )
    if (recipientId === null) return

    if (
      sentTypingState &&
      typingTargetUserId !== null &&
      typingTargetUserId !== recipientId
    ) {
      stopTypingSignal()
    }

    const didSendTypingSignal = sendTypingEvent(
      liveSocket.value,
      recipientId,
      true
    )
    if (didSendTypingSignal) {
      sentTypingState = true
      typingTargetUserId = recipientId
    } else {
      sentTypingState = false
      typingTargetUserId = null
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

    const thread = selectedThread.value
    const recipientId =
      thread.type === 'direct'
        ? normalizeUserId(getDirectMember(thread)?.userId ?? NaN)
        : null
    if (thread.type === 'direct' && recipientId === null) {
      error.value = t('ui.chat.errorInvalidRecipient')
      return
    }

    const content = composerText.value.trim()
    if (!content) return

    sendingMessage.value = true
    error.value = null

    const optimisticMessage = buildOptimisticOutgoingMessage(content, thread)
    if (optimisticMessage) {
      messages.value = [ ...messages.value, optimisticMessage ]
      setOutgoingDeliveryState(optimisticMessage.id, 'sending', {
        exclusive: true,
      })
    }

    composerText.value = ''
    resizeComposerInput()
    stopTypingSignal()
    await scrollConversationToBottom()

    const sent = await sendMessage({
      conversationId: thread.conversationId,
      content,
    })

    sendingMessage.value = false

    if (!sent) {
      if (optimisticMessage) {
        removeMessageById(optimisticMessage.id)
      }
      composerText.value = composerText.value.trim()
        ? `${content}\n${composerText.value}`
        : content
      resizeComposerInput()
      await nextTick()
      focusComposerInput()
      error.value = t('ui.chat.errorSendMessage')
      return
    }

    upsertThreadFromMessage(sent)

    const addedNewMessage = upsertConversationMessage(sent, {
      markOutgoingSent: true,
    })
    if (addedNewMessage) {
      await scrollConversationToBottom()
    }
    await nextTick()
    focusComposerInput()
  }

  async function hydrateInitialThread(): Promise<void> {
    const targetConversationId = normalizeConversationId(
      route.query.conversation
    )
    if (targetConversationId !== null) {
      const existingThread = threads.value.find(
        thread => thread.conversationId === targetConversationId
      )
      if (existingThread) {
        await pickThread(existingThread, {
          syncQuery: false,
        })
        return
      }

      const conversation = await fetchMessageConversationById(
        targetConversationId,
        { force: true }
      )
      if (!conversation) return

      pickThreadFromConversation(conversation)
      const loadedThread = threads.value.find(
        thread => thread.conversationId === conversation.conversationId
      )
      if (loadedThread) {
        await pickThread(loadedThread, {
          syncQuery: false,
        })
      }
      return
    }

    const targetUsername =
      typeof route.query.with === 'string'
        ? route.query.with
        : isMobileViewport.value
          ? undefined
          : threads.value[0]
            ? getThreadDisplayName(threads.value[0])
            : undefined

    if (!targetUsername) return

    const existingThread = threads.value.find(
      thread =>
        thread.type === 'direct' &&
        normalizeUsername(getThreadDisplayName(thread)) ===
          normalizeUsername(targetUsername)
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
      thread => thread.conversationId === directConversation.conversationId
    )
    if (loadedThread) {
      await pickThread(loadedThread, {
        syncQuery: false,
      })
    }
  }

  onMounted(async () => {
    lockMainScroll()

    if (!mobileMediaQuery) {
      mobileMediaQuery = window.matchMedia('(max-width: 50rem)')
      isMobileViewport.value = mobileMediaQuery.matches
    }
    mobileMediaQuery.addEventListener('change', onMobileMediaChange)

    await loadThreads()
    await hydrateInitialThread()
    connectLiveSocket()
    resizeComposerInput()
  })

  onUnmounted(() => {
    stopNavigationEnforcement?.()
    stopNavigationEnforcement = null
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

    mobileMediaQuery?.removeEventListener('change', onMobileMediaChange)

    unlockMainScroll()
  })

  watch(
    () => route.query.conversation,
    async nextConversation => {
      const conversationId = normalizeConversationId(nextConversation)
      if (conversationId === null) return
      if (selectedThread.value?.conversationId === conversationId) return

      const matchingThread = threads.value.find(
        thread => thread.conversationId === conversationId
      )
      if (matchingThread) {
        await pickThread(matchingThread, {
          syncQuery: false,
        })
        return
      }

      const loadedConversation = await fetchMessageConversationById(
        conversationId,
        { force: true }
      )
      if (!loadedConversation) return

      pickThreadFromConversation(loadedConversation)
      const loadedThread = threads.value.find(
        thread => thread.conversationId === loadedConversation.conversationId
      )
      if (loadedThread) {
        await pickThread(loadedThread, {
          syncQuery: false,
        })
      }
    }
  )

  watch(
    () => route.query.with,
    async nextWith => {
      if (typeof nextWith !== 'string') return
      if (
        selectedThread.value &&
        selectedThread.value.type === 'direct' &&
        normalizeUsername(getThreadDisplayName(selectedThread.value)) ===
          normalizeUsername(nextWith)
      ) {
        return
      }

      const matchingThread = threads.value.find(
        thread =>
          thread.type === 'direct' &&
          normalizeUsername(getThreadDisplayName(thread)) ===
            normalizeUsername(nextWith)
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
        thread => thread.conversationId === loadedConversation.conversationId
      )
      if (loadedThread) {
        await pickThread(loadedThread, {
          syncQuery: false,
        })
      }
    }
  )

  watch(
    () => composerText.value,
    () => {
      resizeComposerInput()
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
          <SafeLink to="/">
            <button class="backButton transparent">
              <Icon name="solar:alt-arrow-left-line-duotone" />
              {{ t('common.back') }}
            </button>
          </SafeLink>

          <button
            class="refreshThreadsButton"
            :disabled="loadingThreads"
            @click="loadThreads({ force: true })"
          >
            <Icon name="solar:refresh-line-duotone" />
            {{ t('common.refresh') }}
          </button>
        </header>

        <div class="starterBox">
          <input
            v-model="starterQuery"
            class="starterInput"
            :placeholder="t('ui.chat.startChatPlaceholder')"
            @input="updateStarterSuggestions"
            @focus="updateStarterSuggestions"
          />

          <MentionSuggestions
            v-if="showingStarterSuggestions"
            :suggestions="starterSuggestions"
            @select="chooseStarterSuggestion"
          />
        </div>

        <button class="createGroupButton" @click="openGroupCreateModal">
          <Icon name="solar:users-group-rounded-line-duotone" />
          {{ t('ui.messages.createGroupChat') }}
        </button>

        <div class="threadsContent">
          <p v-if="loadingThreads" class="light threadState">
            {{ t('ui.chat.loadingChats') }}
          </p>
          <p v-else-if="threads.length < 1" class="light threadState">
            {{ t('ui.chat.noMessagesYet') }}
          </p>

          <div class="threadList" v-else>
            <MessageThreadItem
              v-for="thread in threads"
              :key="thread.conversationId"
              :thread="thread"
              :selected="
                selectedThread?.conversationId === thread.conversationId
              "
              :typing="
                getThreadTypingUserId(thread) !== null
                  ? typingByUserId[getThreadTypingUserId(thread)!]
                  : false
              "
              @select="pickThread(thread)"
              @info="openGroupInfoModal(thread)"
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
          class="conversationEmpty"
          v-else-if="!selectedThread && !loadingConversation"
        >
          <Icon name="solar:chat-round-line-line-duotone" />
          <h3>{{ t('ui.chat.emptyState') }}</h3>
        </div>

        <div class="conversationBody" v-else>
          <p v-if="loadingConversation" class="light loadingConversationText">
            {{ t('ui.chat.loadingConversation') }}
          </p>

          <div ref="conversationScroller" class="messageList">
            <template v-for="entry in conversationEntries" :key="entry.key">
              <p
                v-if="entry.type === 'timestamp'"
                class="light messageGapMarker"
              >
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
              />
            </template>
          </div>

          <VStack class="composer" @click.stop>
            <HStack
              class="typingIndicator"
              v-if="
                selectedThread &&
                getThreadTypingUserId(selectedThread) !== null &&
                typingByUserId[getThreadTypingUserId(selectedThread)!]
              "
            >
              <Icon name="svg-spinners:3-dots-move" />
              <p>{{ t('ui.chat.typing') }}</p>
            </HStack>

            <HStack class="composerInputRow">
              <textarea
                ref="composerInput"
                v-model="composerText"
                class="composerInput"
                :placeholder="t('ui.chat.typeMessagePlaceholder')"
                :disabled="!selectedThread"
                @input="onComposerInput"
                @blur="stopTypingSignal"
                @keydown.enter.exact.prevent="sendCurrentMessage"
              />

              <button
                class="prominent sendButton"
                :disabled="
                  !selectedThread || sendingMessage || !composerText.trim()
                "
                @mousedown.prevent
                @click="sendCurrentMessage"
              >
                <Icon name="solar:plain-line-duotone" />
                {{ t('ui.chat.send') }}
              </button>
            </HStack>
          </VStack>
        </div>
      </section>
    </HStack>
  </ContentArea>

  <Modal :visible="showingGroupCreateModal">
    <VStack class="groupModal">
      <HStack class="autoSpace fullWidth">
        <h3>{{ t('ui.messages.createGroupChat') }}</h3>
        <button @click="closeGroupCreateModal">
          <Icon name="mingcute:close-fill" />
        </button>
      </HStack>

      <input
        v-model="groupTitleInput"
        :placeholder="t('ui.messages.groupTitlePlaceholder')"
      />
      <input
        v-model="groupImageUrlInput"
        :placeholder="t('ui.messages.groupImageUrlPlaceholder')"
      />
      <textarea
        v-model="groupDescriptionInput"
        :placeholder="t('ui.messages.groupDescriptionPlaceholder')"
      />

      <div class="groupMemberPicker">
        <input
          v-model="groupMemberQuery"
          :placeholder="t('ui.messages.addMembersPlaceholder')"
          @input="updateGroupMemberSuggestions"
          @focus="updateGroupMemberSuggestions"
        />
        <MentionSuggestions
          v-if="groupMemberSuggestions.length > 0"
          :suggestions="groupMemberSuggestions"
          @select="chooseGroupMemberSuggestion"
        />
      </div>

      <VStack v-if="selectedGroupMemberIds.length > 0" class="groupMembers">
        <HStack
          v-for="member in getSelectedGroupMembers()"
          :key="member.id"
          class="autoSpace fullWidth groupMemberRow"
        >
          <p>@{{ member.username }}</p>
          <button
            class="transparent"
            @click="removeSelectedGroupMember(member.id)"
          >
            <Icon name="solar:trash-bin-trash-line-duotone" />
          </button>
        </HStack>
      </VStack>

      <p v-if="groupStatusMessage" class="light">
        {{ groupStatusMessage }}
      </p>

      <HStack class="autoSpace fullWidth">
        <button @click="closeGroupCreateModal" class="transparent">
          {{ t('ui.messages.cancel') }}
        </button>
        <button
          class="prominent"
          :disabled="savingGroup || selectedGroupMemberIds.length < 1"
          @click="createCurrentGroupConversation"
        >
          <Icon name="solar:pen-new-square-line-duotone" />
          {{ t('ui.messages.createGroupChatAction') }}
        </button>
      </HStack>
    </VStack>
  </Modal>

  <Modal :visible="showingGroupInfoModal">
    <VStack v-if="groupInfoThread" class="groupModal">
      <HStack class="autoSpace fullWidth">
        <h3>{{ getThreadDisplayName(groupInfoThread) }}</h3>
        <button @click="closeGroupInfoModal">
          <Icon name="mingcute:close-fill" />
        </button>
      </HStack>

      <img
        v-if="getThreadAvatarUrl(groupInfoThread)"
        class="groupInfoImage"
        :src="getThreadAvatarUrl(groupInfoThread)!"
        :alt="
          t('ui.messages.groupImageAlt', {
            name: getThreadDisplayName(groupInfoThread),
          })
        "
      />

      <template v-if="groupInfoThread.creatorId === auth.user?.id">
        <input
          v-model="groupTitleInput"
          :placeholder="t('ui.messages.groupTitlePlaceholder')"
        />
        <input
          v-model="groupImageUrlInput"
          :placeholder="t('ui.messages.groupImageUrlPlaceholder')"
        />
        <textarea
          v-model="groupDescriptionInput"
          :placeholder="t('ui.messages.groupDescriptionPlaceholder')"
        />
        <button
          class="prominent"
          :disabled="savingGroup"
          @click="saveCurrentGroupInfo"
        >
          {{ t('ui.messages.saveInfo') }}
        </button>

        <div class="groupMemberPicker">
          <input
            v-model="groupMemberQuery"
            :placeholder="t('ui.messages.inviteMemberPlaceholder')"
            @input="updateGroupMemberSuggestions"
            @focus="updateGroupMemberSuggestions"
          />
          <MentionSuggestions
            v-if="groupMemberSuggestions.length > 0"
            :suggestions="groupMemberSuggestions"
            @select="chooseGroupMemberSuggestion"
          />
        </div>

        <VStack v-if="selectedGroupMemberIds.length > 0" class="groupMembers">
          <HStack
            v-for="member in getSelectedGroupMembers()"
            :key="member.id"
            class="autoSpace fullWidth groupMemberRow"
          >
            <p>@{{ member.username }}</p>
            <button
              class="transparent"
              @click="removeSelectedGroupMember(member.id)"
            >
              <Icon name="solar:trash-bin-trash-line-duotone" />
            </button>
          </HStack>
        </VStack>

        <button
          :disabled="savingGroup || selectedGroupMemberIds.length < 1"
          @click="inviteSelectedGroupMembers"
        >
          {{ t('ui.messages.addSelectedMembers') }}
        </button>
      </template>

      <VStack class="groupMembers">
        <h4>{{ t('ui.messages.members') }}</h4>
        <HStack
          v-for="member in groupInfoThread.members"
          :key="member.userId"
          class="autoSpace fullWidth groupMemberRow"
        >
          <p>@{{ member.username }}</p>
          <p v-if="member.isCreator" class="light">
            {{ t('ui.messages.creator') }}
          </p>
          <button
            v-else-if="groupInfoThread.creatorId === auth.user?.id"
            class="transparent"
            :disabled="savingGroup"
            @click="removeExistingGroupMember(member.userId)"
          >
            <Icon name="solar:trash-bin-trash-line-duotone" />
          </button>
        </HStack>
      </VStack>

      <p v-if="groupStatusMessage" class="light">
        {{ groupStatusMessage }}
      </p>
    </VStack>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/variables"
  @use "@/styles/utils"

  .messagesLayout
    width: 100%
    height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 3rem)
    min-height: 0
    padding-top: env(safe-area-inset-top)
    padding-bottom: max(env(safe-area-inset-bottom), 0rem)
    display: grid
    grid-template-columns: minmax(18rem, 20rem) minmax(0, 1fr)
    align-items: stretch
    gap: 0.75rem

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

  .groupModal
    @include utils.itemBackground
    width: min(32rem, calc(100vw - 3rem))
    align-items: stretch

    h3, h4, p
      margin: 0

    textarea
      min-height: 5rem
      resize: vertical

    .groupMemberPicker
      position: relative

      input
        width: 100%

      :deep(.mentionSuggestions)
        top: calc(100% + 0.35rem)
        left: 0
        right: 0
        width: 100%
        max-width: none

    .groupMembers
      align-items: stretch

    .groupMemberRow
      align-items: center

    .groupInfoImage
      width: 100%
      max-height: 12rem
      object-fit: cover
      border-radius: 1rem

  @media (max-width: variables.$mobileWidth)
    .messagesLayout
      grid-template-columns: minmax(0, 1fr)
      height: calc(100dvh - 1rem)
      padding-bottom: calc(max(env(safe-area-inset-bottom), 0.75rem) + 0.15rem)
</style>
