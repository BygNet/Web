<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, ref } from 'vue'

  import { api } from '@/api/client'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
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
      <div v-for="img in images" :key="img.id" class="picCard">
        <img :src="img.imageUrl" :alt="img.title" />

        <VStack class="picInfo">
          <h3>{{ img.title }}</h3>

          <HStack class="autoSpace picMeta">
            <p>{{ img.author }}</p>
            <p>{{ new Date(img.createdDate).toLocaleDateString() }}</p>
          </HStack>

          <HStack class="autoSpace">
            <button>
              <Icon icon="solar:hearts-line-duotone" />
              {{ img.likes }}
            </button>
            <button>
              <Icon icon="solar:share-line-duotone" />
              {{ img.shares }}
            </button>
          </HStack>
        </VStack>
      </div>
    </div>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .grid
    display: grid
    width: 100%
    grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr))
    gap: 1rem

    .picCard
      @include utils.itemBackground
      overflow: hidden
      display: flex
      flex-direction: column

      img
        width: 100%
        height: 20rem

      .picInfo
        width: 100%
        padding: 0 1rem
</style>
