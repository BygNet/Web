<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'

  import FullscreenCover from '@/components/layout/FullscreenCover.vue'
  import { blurContent } from '@/data/visibility.ts'

  onMounted(() => {
    blurContent.value = true
  })
  onUnmounted(() => {
    blurContent.value = false
  })
</script>

<template>
  <FullscreenCover class="modalCover">
    <div class="modalContent">
      <slot />
    </div>
  </FullscreenCover>
</template>

<style scoped lang="sass">
  .modalCover
    --margin: 1.5rem
    z-index: 500
    padding: var(--margin) 0

    .modalContent
      width: fit-content
      min-width: 18rem
      max-width: 50rem
      max-height: calc(100vh - var(--padding)*2 - var(--margin)*2 - var(--tabBarHeight))
      margin-bottom: var(--tabBarHeight)
</style>
