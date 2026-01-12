<script setup lang="ts">
  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import MobileNav from '@/components/nav/MobileNav.vue'
</script>

<template>
  <div class="bygApp">
    <DesktopNav />
    <main>
      <RouterView />
      <MobileNav />
    </main>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"

  .bygApp
    --padding: 2rem

    display: flex
    flex-direction: row
    width: 100vw
    height: 100vh

  main
    height: 100vh
    max-width: 55rem
    padding: 0 1rem
    margin: 0 auto
    overflow: scroll
    scrollbar-width: none

  @media (max-width: variables.$mobileWidth)
    .bygApp
      --padding: 0.75rem
      flex-direction: column
</style>
