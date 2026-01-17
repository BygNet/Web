<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { auth } from '@/auth/session'
  import { formatNumber, formatStat } from '@/utils/formatters.ts'

  const props = defineProps<{
    likes: number
    id: number
    apiPath: string
    compact?: boolean
  }>()

  const router = useRouter()

  const fetchUrl: string = `${import.meta.env.VITE_API_BASE}${props.apiPath}/${props.id}`

  const likeCount: Ref<number> = ref(0)
  const liking: Ref<boolean> = ref(false)

  onMounted(() => {
    likeCount.value = props.likes
  })

  async function like(): Promise<void> {
    if (!auth.user) {
      await router.push({ name: 'login' })
      return
    }

    if (liking.value) return

    liking.value = true
    try {
      const res = await fetch(fetchUrl, { method: 'POST' })
      if (!res.ok) throw new Error('Like failed')

      likeCount.value++
    } catch (err) {
      console.error('Like failed', err)
    } finally {
      liking.value = false
    }
  }
</script>

<template>
  <button class="likeButton" :disabled="liking" @click="like">
    <Icon icon="solar:hearts-line-duotone" />
    {{ compact ? formatStat(likeCount) : formatNumber(likeCount) }}
  </button>
</template>
