<script setup lang="ts">
  import type { BygComment } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { nextTick, onMounted, type Ref, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import MentionSuggestions from '@/components/posts/MentionSuggestions.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import { fetchUserSuggestions } from '@/data/mentions'
  import { taskList } from '@/data/tasks'
    import type { BygUserSuggestion } from '@/types/mentions'
  import { formatDate } from '@/utils/formatters'
  import {
    applyMention,
    getMentionContext,
    type MentionContext,
  } from '@/utils/mentions'

  const comments: Ref<BygComment[]> = ref([])
  const writtenComment: Ref<string> = ref('')
  const commentTextarea: Ref<HTMLTextAreaElement | null> = ref(null)
  const sendingComment: Ref<boolean> = ref(false)
  const mentionSuggestions: Ref<BygUserSuggestion[]> = ref([])
  const mentionContext: Ref<MentionContext | null> = ref(null)
  const showingMentionSuggestions: Ref<boolean> = ref(false)
  let mentionRequestId = 0

  const config = useRuntimeConfig()
  const localePath = useLocalePath()
  const { t } = useI18n()

  const props = defineProps<{
    id: number
    author: string
    getUrl: string
    postUrl: string
    count: number
  }>()

  const fetchComments = async () => {
    const res = await fetch(
      `${config.public.apiBase}${props.getUrl}/${props.id}`
    )
    if (!res.ok) {
      console.error('Failed to fetch comments')
      comments.value = []
      return
    }
    const data = (await res.json()) as BygComment[]

    for (const c of data) {
      const html = await marked.parse(c.content ?? '')
      ;(c as any).rendered = DOMPurify.sanitize(html)
    }

    comments.value = data
  }

  function clearMentionSuggestions(): void {
    showingMentionSuggestions.value = false
    mentionSuggestions.value = []
    mentionContext.value = null
  }

  async function updateMentionSuggestions(): Promise<void> {
    const textarea = commentTextarea.value
    if (!textarea) {
      clearMentionSuggestions()
      return
    }

    const caret = textarea.selectionStart ?? writtenComment.value.length
    const context = getMentionContext(writtenComment.value, caret)
    if (!context || context.query.length < 1) {
      clearMentionSuggestions()
      return
    }

    mentionContext.value = context
    const requestId = ++mentionRequestId
    const suggestions = await fetchUserSuggestions(context.query)

    if (requestId !== mentionRequestId) {
      return
    }

    mentionSuggestions.value = suggestions
    showingMentionSuggestions.value = suggestions.length > 0
  }

  function onCommentTextareaInteraction(): void {
    updateMentionSuggestions().catch((): void => {
      clearMentionSuggestions()
    })
  }

  async function insertMention(username: string): Promise<void> {
    if (!mentionContext.value) return

    const result = applyMention(
      writtenComment.value,
      mentionContext.value,
      username
    )
    writtenComment.value = result.text
    clearMentionSuggestions()

    await nextTick()
    commentTextarea.value?.focus()
    commentTextarea.value?.setSelectionRange(result.caret, result.caret)
  }

  async function postComment(): Promise<void> {
    if (!auth.user) {
      await navigateTo(localePath('login'))
      return
    }

    if (!writtenComment.value.trim()) {
      return
    }

    sendingComment.value = true
    taskList.value.push('commenting')

    const res = await api(props.postUrl, {
      method: 'POST',
      body: JSON.stringify({ id: props.id, content: writtenComment.value }),
    })

    if (!res.ok) {
      console.error('Failed to post comment')
      return
    }

    writtenComment.value = ''
    clearMentionSuggestions()
    await fetchComments()

    sendingComment.value = false
    taskList.value.remove('commenting')
  }

  onMounted(() => {
    fetchComments()
  })
</script>

<template>
  <VStack class="commentsView">
    <h2>{{ t('ui.comments.titleWithCount', { count: comments.length }) }}</h2>

    <HStack id="writeComment">
      <VStack class="commentInput">
        <textarea
          ref="commentTextarea"
          name="writeComment"
          v-model="writtenComment"
        :placeholder="t('ui.comments.writePlaceholder')"
          @input="onCommentTextareaInteraction"
          @keyup="onCommentTextareaInteraction"
          @click="onCommentTextareaInteraction"
        />

        <MentionSuggestions
          v-if="showingMentionSuggestions"
          :suggestions="mentionSuggestions"
          @select="insertMention"
        />
      </VStack>

      <button @click="postComment" :disabled="sendingComment">
        <Icon icon="solar:plain-line-duotone" />
        {{ t('ui.comments.postButton') }}
      </button>
    </HStack>

    <VStack v-if="comments.length > 0" class="commentsView">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <HStack class="fullWidth autoSpace commentsMeta">
          <UsernameView
            :name="comment.author"
            :author="author == comment.author"
          />
          <p>{{ formatDate(comment.createdDate) }}</p>
        </HStack>

        <div class="commentContent" v-html="(comment as any).rendered" />
      </div>
    </VStack>

    <h3 v-else>{{ t('ui.comments.emptyState') }}</h3>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  #writeComment
    width: 100%
    align-items: flex-start

    .commentInput
      flex-grow: 1
      min-width: 20rem
      gap: 0.25rem

    textarea
      width: 100%
      resize: vertical
      background: transparent
      outline: none

  .commentsView
    width: 100%

    .comment
      @include utils.itemBackground
      @include utils.maxPaddedWidth

      --padding: 0.75rem
      --cornerRadius: 1rem
      align-items: flex-start

      .commentsMeta
        opacity: 0.7

      .commentContent
        width: 100%
        align-items: flex-start

        :deep(p)
          margin: 0
</style>
