<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue'

  import FullscreenCover from '@/components/layout/FullscreenCover.vue'
  import { blurContent } from '@/data/visibility.ts'

  const props = defineProps<{
    independent?: boolean
  }>()

  onMounted(() => {
    if (props.independent) return
    blurContent.value = true
  })
  onUnmounted(() => {
    blurContent.value = false
  })
</script>

<template>
  <FullscreenCover class="modalCover" :class="{ blurred: independent }">
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

    &.blurred
      backdrop-filter: blur(0.5rem)

    .modalContent
      width: fit-content
      min-width: 18rem
      max-width: 50rem
      margin-top: env(safe-area-inset-top)
      max-height: calc(100vh - var(--padding)*2 - env(safe-area-inset-top) - env(safe-area-inset-bottom))
      margin-bottom: var(--tabBarHeight)
      border-radius: 1.5rem
      overflow: scroll
</style>
