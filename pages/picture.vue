<script setup lang="ts">
  import type { BygImage } from '@bygnet/types'
  import { onMounted, type Ref, ref, watchEffect } from 'vue'

  import { api } from '@/api/client'
  import ImageItem from '@/components/images/ImageItem.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import SkeletonImage from '@/components/layout/skeletons/SkeletonImage.vue'
  import { IMAGE_CACHE_TTL, imageCache, imageCacheTime } from '@/data/caches'
  import { imageReloader } from '@/data/events'
  import { taskList } from '@/data/tasks'
  import { PageMetaByPath } from '@/data/pages'
  import { title } from '@/data/title'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
  const pageMeta = PageMetaByPath['/picture']

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })
  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })

  const images: Ref<BygImage[]> = ref([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)

  onMounted(async () => {
    try {
      // use cache if fresh
      if (
        imageCache.value &&
        Date.now() - imageCacheTime.value < IMAGE_CACHE_TTL
      ) {
        images.value = imageCache.value
        loading.value = false
        return
      }

      taskList.value.push('loading images')
      const res = await api('/latest-images')
      if (!res.ok) throw new Error()

      const data = await res.json()
      images.value = data
      imageCache.value = data
      imageCacheTime.value = Date.now()
    } catch {
      taskList.value.remove('loading images')
      error.value = t('common.errorLoadImages')
    } finally {
      taskList.value.remove('loading images')
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
      error.value = t('common.errorReloadImages')
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
    <div v-if="loading" class="grid">
      <SkeletonImage v-for="i in 100" :key="i" />
    </div>

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
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr))
    gap: 0.5rem
    align-items: stretch
</style>
