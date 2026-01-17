<script setup lang="ts">
  import { onMounted, ref } from 'vue'

  import { api } from '@/api/client'
  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title'
  import type { BygImage } from '@/types/contentTypes'

  title.value = 'Picture'

  const images = ref<BygImage[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  onMounted(async () => {
    try {
      const res = await api('/latest-images')
      if (!res.ok) throw new Error()

      images.value = await res.json()
    } catch {
      error.value = 'Failed to load images'
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <ContentArea class="bygPictures">
    <p v-if="loading">Loading images…</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else class="grid">
      <ImageItem v-for="img in images" :key="img.id" :image="img" />
    </div>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .grid
    display: grid
    width: 100%
    grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr))
    gap: 0.5rem
</style>
