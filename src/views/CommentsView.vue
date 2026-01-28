<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session.ts'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import router from '@/router.ts'
  import type { BygComment } from '@/types/contentTypes.ts'
  import { formatDate } from '@/utils/formatters.ts'

  const comments: Ref<BygComment[]> = ref([])
  const writtenComment: Ref<string> = ref('')
  const props = defineProps<{
    id: number
    author: string
    getUrl: string
    postUrl: string
    count: number
  }>()

  const fetchComments = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE}${props.getUrl}/${props.id}`
    )
    if (!res.ok) {
      console.error('Failed to fetch comments')
      comments.value = []
      return
    }
    comments.value = (await res.json()) as BygComment[]
  }

  onMounted(() => {
    fetchComments()
  })

  function postComment(): void {
    if (!auth.user) router.push({ name: 'login' })
    if (!writtenComment.value) return
    api(props.postUrl, {
      method: 'POST',
      body: JSON.stringify({ id: props.id, content: writtenComment.value }),
    }).then(async (res: { ok: any }) => {
      if (!res.ok) {
        console.error('Failed to post comment')
        return
      }

      writtenComment.value = ''
      await fetchComments()
    })
  }
</script>

<template>
  <VStack class="commentsView">
    <h2>Comments: {{ comments.length }}</h2>

    <HStack id="writeComment">
      <textarea
        name="writeComment"
        v-model="writtenComment"
        placeholder="Write a comment..."
      />
      <button @click="postComment">
        <Icon icon="solar:plain-line-duotone" />
        Post
      </button>
    </HStack>

    <VStack v-if="comments.length > 0" class="commentsView">
      <div v-for="comment in comments" class="comment">
        <HStack class="fullWidth autoSpace commentsMeta">
          <UsernameView
            :name="comment.author"
            :author="author == comment.author"
          />
          <p>{{ formatDate(comment.createdDate) }}</p>
        </HStack>

        {{ comment.content }}
      </div>
    </VStack>

    <h3 v-else>No comments yet.</h3>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  #writeComment
    width: 100%

    textarea
      flex-grow: 1
      min-width: 20rem
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
</style>
