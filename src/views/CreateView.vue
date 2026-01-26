<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref } from 'vue'

  import { auth } from '@/auth/session.ts'
  import HStack from '@/components/layout/HStack.vue'
  import Modal from '@/components/layout/Modal.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { imageReloader, reloader } from '@/data/events.ts'
  import { showingCreateModal } from '@/data/visibility.ts'
  import type { CreateType } from '@/types/unions.ts'

  const pickedType: Ref<CreateType | undefined> = ref(undefined)

  const postText = ref('')
  const postTitle = ref('')
  const imageUrl = ref('')
  const imageTitle = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const charCount = computed(() => postText.value.length)
  const charLimit = 1000

  async function submitPost() {
    if (!auth.token) {
      error.value = 'Not logged in'
      return
    }

    loading.value = true
    error.value = null

    const res = await fetch('http://localhost:5001/create-post', {
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

    if (!res.ok) {
      error.value = 'Failed to create post'
      return
    }

    postText.value = ''
    postTitle.value = ''
    pickedType.value = undefined
    showingCreateModal.value = false
    reloader.emit('reload')
  }

  async function submitImage() {
    if (!auth.token) {
      error.value = 'Not logged in'
      return
    }

    loading.value = true
    error.value = null

    const res = await fetch('http://localhost:5001/upload-image', {
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

    loading.value = false

    if (!res.ok) {
      error.value = 'Failed to upload image'
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
  <Modal>
    <div class="createView" :class="{ composer: pickedType != undefined }">
      <VStack v-if="pickedType == undefined">
        <HStack class="autoSpace fullWidth">
          <h2>Create...</h2>

          <button @click="showingCreateModal = false">
            <Icon icon="mingcute:close-fill" />
          </button>
        </HStack>

        <HStack class="typePicker">
          <VStack class="type" @click="pickedType = 'post'">
            <Icon icon="solar:pen-line-duotone" />
            Write Post
          </VStack>

          <VStack class="type" @click="pickedType = 'image'">
            <Icon icon="solar:gallery-send-line-duotone" />
            Add Image
          </VStack>
        </HStack>
      </VStack>

      <VStack v-else-if="pickedType == 'post'" class="form">
        <HStack class="autoSpace fullWidth">
          <h2>New Post</h2>
          <button @click="pickedType = undefined">
            <Icon icon="mingcute:arrow-left-fill" />
          </button>
        </HStack>

        <input v-model="postTitle" type="text" placeholder="Post title..." />

        <textarea
          v-model="postText"
          :maxlength="charLimit"
          placeholder="Write something..."
        />

        <div class="counter">{{ charCount }} / {{ charLimit }}</div>

        <div v-if="error" class="error">{{ error }}</div>

        <button
          class="prominent"
          :disabled="loading || charCount === 0"
          @click="submitPost"
        >
          <Icon icon="solar:upload-minimalistic-bold-duotone" />
          Post
        </button>
      </VStack>

      <VStack v-else-if="pickedType == 'image'" class="form">
        <HStack class="autoSpace fullWidth">
          <h2>Upload Image</h2>
          <button @click="pickedType = undefined">
            <Icon icon="mingcute:arrow-left-fill" />
          </button>
        </HStack>

        <input v-model="imageTitle" type="text" placeholder="Image title..." />

        <input
          v-model="imageUrl"
          type="url"
          placeholder="https://example.com/image.png"
        />

        <div v-if="error" class="error">{{ error }}</div>

        <button
          class="prominent"
          :disabled="loading || imageUrl.length === 0"
          @click="submitImage"
        >
          <Icon icon="solar:gallery-send-line-duotone" />
          Upload
        </button>
      </VStack>
    </div>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .createView
    @include utils.itemBackground
    border-radius: 2rem
    padding: 1rem

    &.composer
      min-width: 20rem
      max-width: 100%

  .typePicker
    gap: 0.5rem

    .type
      @include utils.itemBackground
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

  textarea, input
    --padding: 0.25rem

    @include utils.maxPaddedWidth

  .counter
    text-align: right
    font-size: small
    opacity: 0.7
</style>
