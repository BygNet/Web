<script setup lang="ts">
  import MobileNav from '@/components/nav/MobileNav.vue'
</script>

<template>
  <div class="contentArea">
    <slot />
  </div>
  <MobileNav />
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    min-height: 100vh
</style>
