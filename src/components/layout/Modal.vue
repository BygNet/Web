<script setup lang="ts">
  import FullscreenCover from '@/components/layout/FullscreenCover.vue'
</script>

<template>
  <FullscreenCover class="modalCover">
    <slot />
  </FullscreenCover>
</template>

<style scoped lang="sass">
  .modalCover
    z-index: 500
</style>
<style lang="sass">
  .modalCover div.card
    width: fit-content !important
    min-width: 18rem !important
    max-width: 50rem !important
</style>
