<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, type Ref, ref } from 'vue'

  const props = defineProps<{
    shares: number
    id: number
    apiPath: string
  }>()

  const fetchUrl: string = `${import.meta.env.VITE_API_BASE}${props.apiPath}/${props.id}`
  const shareCount: Ref<number> = ref(0)

  onMounted(() => {
    shareCount.value = props.shares
  })

  async function share(): Promise<void> {
    try {
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error('Failed to fetch share URL')

      const url = await res.text()

      // Prefer native share sheet if available
      if (navigator.share) {
        await navigator.share({ url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard')
      }

      shareCount.value++
    } catch (err) {
      console.error('Share failed', err)
    }
  }
</script>

<template>
  <button class="shareButton" @click="share">
    <Icon icon="solar:share-line-duotone" />
    {{ shareCount }}
  </button>
</template>
