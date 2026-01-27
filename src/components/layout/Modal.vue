<script setup lang="ts">
  import FullscreenCover from '@/components/layout/FullscreenCover.vue'
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
    //justify-content: flex-start
    padding: var(--margin) 0

    .modalContent
      width: fit-content
      min-width: 18rem
      max-width: 50rem
      max-height: calc(100vh - var(--padding)*2 - var(--margin)*2 - var(--tabBarHeight))
      margin-bottom: var(--tabBarHeight)
</style>
