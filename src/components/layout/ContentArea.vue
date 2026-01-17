<script setup lang="ts">
  import { useAttrs } from 'vue'

  import MobileNav from '@/components/nav/MobileNav.vue'

  const attrs = useAttrs()
</script>

<template>
  <div class="contentArea" v-bind="attrs">
    <slot />
  </div>
  <MobileNav />
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    min-height: 100vh
</style>
