<script setup lang="ts">
  import type { CreateType } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import DOMPurify from 'dompurify'
  import { marked } from 'marked'
  import { computed, nextTick, type Ref, ref, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import MentionSuggestions from '@/components/posts/MentionSuggestions.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import { imageReloader, reloader } from '@/data/events'
  import { fetchUserSuggestions } from '@/data/mentions'
  import { taskList } from '@/data/tasks'
  import { showingCreateModal } from '@/data/visibility'
  import type { BygUserSuggestion } from '@/types/mentions'
  import { formatDate } from '@/utils/formatters'
  import {
    applyMention,
    getMentionContext,
    type MentionContext,
  } from '@/utils/mentions'

  const config = useRuntimeConfig()
  const { t } = useI18n()

  const pickedType: Ref<CreateType | undefined> = ref(undefined)
  const showingPreview: Ref<boolean> = ref(false)

  const postText = ref('')
  const postTitle = ref('')
  const imageUrl = ref('')
  const imageTitle = ref('')
  const postTextarea: Ref<HTMLTextAreaElement | null> = ref(null)
  const postMentionSuggestions: Ref<BygUserSuggestion[]> = ref([])
  const postMentionContext: Ref<MentionContext | null> = ref(null)
  const showingPostMentionSuggestions: Ref<boolean> = ref(false)
  let postMentionRequestId = 0
  const loading = ref(false)
  const error = ref<string | null>(null)

  const charCount = computed(() => postText.value.length)
  const charLimit = 1000

  const renderedMarkdown = ref('')

  watchEffect(async () => {
    const html = await marked.parse(postText.value || '')
    renderedMarkdown.value = DOMPurify.sanitize(html)
  })

  function clearPostMentionSuggestions(): void {
    showingPostMentionSuggestions.value = false
    postMentionSuggestions.value = []
    postMentionContext.value = null
  }

  async function updatePostMentionSuggestions(): Promise<void> {
    const textarea = postTextarea.value
    if (!textarea) {
      clearPostMentionSuggestions()
      return
    }

    const caret = textarea.selectionStart ?? postText.value.length
    const context = getMentionContext(postText.value, caret)
    if (!context || context.query.length < 1) {
      clearPostMentionSuggestions()
      return
    }

    postMentionContext.value = context
    const requestId = ++postMentionRequestId
    const suggestions = await fetchUserSuggestions(context.query)

    if (requestId !== postMentionRequestId) {
      return
    }

    postMentionSuggestions.value = suggestions
    showingPostMentionSuggestions.value = suggestions.length > 0
  }

  function onPostTextareaInteraction(): void {
    updatePostMentionSuggestions().catch((): void => {
      clearPostMentionSuggestions()
    })
  }

  async function insertPostMention(username: string): Promise<void> {
    if (!postMentionContext.value) return

    const result = applyMention(
      postText.value,
      postMentionContext.value,
      username
    )

    postText.value = result.text
    clearPostMentionSuggestions()

    await nextTick()
    postTextarea.value?.focus()
    postTextarea.value?.setSelectionRange(result.caret, result.caret)
  }

  async function submitPost() {
    if (!auth.token) {
      error.value = t('ui.create.errorNotLoggedIn')
      return
    }

    taskList.value.push('posting')
    loading.value = true
    error.value = null

    const res = await fetch(`${config.public.apiBase}/create-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        title: postTitle.value,
        content: postText.value,
      }),
    })

    loading.value = false
    taskList.value.remove('posting')

    if (!res.ok) {
      error.value = t('ui.create.errorCreatePost')
      return
    }

    postText.value = ''
    postTitle.value = ''
    clearPostMentionSuggestions()
    pickedType.value = undefined
    showingCreateModal.value = false
    reloader.emit('reload')
  }

  async function submitImage() {
    if (!auth.token) {
      error.value = t('ui.create.errorNotLoggedIn')
      return
    }

    taskList.value.push('uploading')
    loading.value = true
    error.value = null

    const res = await fetch(`${config.public.apiBase}/upload-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({
        title: imageTitle.value,
        imageUrl: imageUrl.value,
      }),
    })

    taskList.value.remove('uploading')
    loading.value = false

    if (!res.ok) {
      error.value = t('ui.create.errorUploadImage')
      return
    }

    imageUrl.value = ''
    imageTitle.value = ''
    pickedType.value = undefined
    showingCreateModal.value = false
    imageReloader.emit('reload')
  }
</script>

<template>
  <Modal :visible="showingCreateModal && !showingPreview">
    <div class="createView" :class="{ composer: pickedType != undefined }">
      <VStack v-if="pickedType == undefined">
        <HStack class="autoSpace fullWidth">
          <h2>{{ t('ui.create.title') }}</h2>

          <button @click="showingCreateModal = false">
            <Icon icon="mingcute:close-fill" />
          </button>
        </HStack>

        <HStack class="typePicker">
          <VStack class="type" @click="pickedType = 'post'">
            <Icon icon="solar:pen-line-duotone" />
            {{ t('ui.create.typePost') }}
          </VStack>

          <VStack class="type" @click="pickedType = 'image'">
            <Icon icon="solar:gallery-send-line-duotone" />
            {{ t('ui.create.typeImage') }}
          </VStack>
        </HStack>
      </VStack>

      <VStack v-else-if="pickedType == 'post'" class="form">
        <HStack class="autoSpace fullWidth">
          <h2>{{ t('ui.create.newPost') }}</h2>
          <button @click="pickedType = undefined">
            <Icon icon="mingcute:arrow-left-fill" />
          </button>
        </HStack>

        <input
          v-model="postTitle"
          type="text"
          :placeholder="t('ui.create.postTitlePlaceholder')"
        />

        <div class="mentionComposer">
          <textarea
            ref="postTextarea"
            v-model="postText"
            :maxlength="charLimit"
            :placeholder="t('ui.create.postBodyPlaceholder')"
            @input="onPostTextareaInteraction"
            @keyup="onPostTextareaInteraction"
            @click="onPostTextareaInteraction"
          />

          <MentionSuggestions
            v-if="showingPostMentionSuggestions"
            :suggestions="postMentionSuggestions"
            @select="insertPostMention"
          />
        </div>

        <div class="counter">{{ charCount }} / {{ charLimit }}</div>

        <div v-if="error" class="error">{{ error }}</div>

        <HStack class="fullWidth autoSpace">
          <button
            class="prominent"
            :disabled="loading || charCount === 0"
            @click="submitPost"
          >
            <Icon icon="solar:upload-minimalistic-bold-duotone" />
            {{ t('ui.create.postButton') }}
          </button>

          <button class="transparent" @click="showingPreview = true">
            {{ t('ui.create.previewButton') }}
          </button>
        </HStack>
      </VStack>

      <VStack v-else-if="pickedType == 'image'" class="form">
        <HStack class="autoSpace fullWidth">
          <h2>{{ t('ui.create.uploadImage') }}</h2>
          <button @click="pickedType = undefined">
            <Icon icon="mingcute:arrow-left-fill" />
          </button>
        </HStack>

        <input
          v-model="imageTitle"
          type="text"
          :placeholder="t('ui.create.imageTitlePlaceholder')"
        />

        <input
          v-model="imageUrl"
          type="url"
          :placeholder="t('ui.create.imageUrlPlaceholder')"
        />

        <img
          class="previewImage"
          v-if="imageUrl"
          :src="imageUrl"
          :alt="t('ui.create.previewTitle')"
        />

        <div v-if="error" class="error">{{ error }}</div>

        <button
          class="prominent"
          :disabled="loading || imageUrl.length === 0"
          @click="submitImage"
        >
          <Icon icon="solar:gallery-send-line-duotone" />
          {{ t('ui.create.uploadButton') }}
        </button>
      </VStack>
    </div>
  </Modal>

  <Modal :visible="showingCreateModal && showingPreview">
    <div class="createPreview">
      <HStack class="fullWidth autoSpace">
        <h2>{{ t('ui.create.previewTitle') }}</h2>
        <button @click="showingPreview = false">
          <Icon icon="mingcute:arrow-left-fill" />
        </button>
      </HStack>

      <VStack class="postPreview">
        <h3>{{ postTitle }}</h3>
        <HStack class="autoSpace fullWidth light">
          <UsernameView
            :name="auth.user?.username ?? t('ui.create.unknownUser')"
          />
          <p>{{ formatDate(new Date().toISOString()) }}</p>
        </HStack>

        <div class="markdownPreview" v-html="renderedMarkdown"></div>
      </VStack>
    </div>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .createView, .createPreview
    @include utils.itemBackground
    border-radius: 2rem
    padding: 1rem

    &.composer
      min-width: 20rem
      max-width: 100%

  .postPreview, .markdownPreview
    width: 100%
    align-items: flex-start

    .markdownPreview
      white-space: normal

  .typePicker
    gap: 0.5rem

    .type
      @include utils.itemBackground
      --cornerRadius: 1.25rem

      cursor: pointer
      font-size: large

      svg
        width: 3rem
        height: 3rem

  .form
    width: 100%
    gap: 0.25rem

  textarea
    min-height: 10rem

  .mentionComposer
    width: 100%
    gap: 0.25rem

  textarea, input
    --padding: 0.25rem

    @include utils.maxPaddedWidth

  .counter
    text-align: right
    font-size: small
    opacity: 0.7

  .previewImage
    max-width: 10rem
    max-height: 10rem
    min-height: 2rem
</style>
