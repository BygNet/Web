<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { onMounted, type Ref, ref } from 'vue'

  import { api } from '@/api/client'
  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import { imageCache, imageCacheTime } from '@/data/caches'
  import { imageReloader } from '@/data/events.ts'
  import { title } from '@/data/title'

  title.value = 'Picture'

  const images: Ref<BygImage[]> = ref([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const CACHE_TTL = 30_000

  onMounted(async () => {
    try {
      // use cache if fresh
      if (imageCache.value && Date.now() - imageCacheTime.value < CACHE_TTL) {
        images.value = imageCache.value
        loading.value = false
        return
      }

      const res = await api('/latest-images')
      if (!res.ok) throw new Error()

      const data = await res.json()
      images.value = data
      imageCache.value = data
      imageCacheTime.value = Date.now()
    } catch {
      error.value = `Failed to load images`
    } finally {
      loading.value = false
    }
  })

  async function reloadAndScroll() {
    imageCache.value = null
    loading.value = true
    error.value = null

    try {
      const res = await api('/latest-images')
      if (!res.ok) throw new Error()

      const data = await res.json()
      images.value = data
      imageCache.value = data
      imageCacheTime.value = Date.now()

      // wait for DOM update, then scroll to top
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      })
    } catch {
      error.value = 'Failed to reload images'
    } finally {
      loading.value = false
    }
  }

  imageReloader.on('reload', () => {
    reloadAndScroll()
  })
</script>

<template>
  <ContentArea class="bygPictures">
    <EmptyState v-if="loading" message="Loading images..." />
    <ErrorState v-else-if="error" :message="error" />

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
