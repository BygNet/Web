<script setup lang="ts">
  import { onMounted, type Ref, ref } from 'vue'

  import { api } from '@/api/client'
  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import { title } from '@/data/title'
  import type { BygImage } from '@/types/contentTypes'

  title.value = 'Picture'

  const images: Ref<BygImage[]> = ref([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)

  onMounted(async () => {
    try {
      const res = await api('/latest-images')
      if (!res.ok) throw new Error()

      images.value = await res.json()
    } catch {
      error.value = `Failed to load images`
    } finally {
      loading.value = false
    }
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
