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
    flex-grow: 1
    height: 100dvh
    max-width: 55rem
    padding: 0 calc(var(--padding)/2)
    margin: 0 auto
    overflow-y: scroll
    scrollbar-width: none

  @media (max-width: variables.$mobileWidth)
    .bygApp
      --padding: 0.5rem
      flex-direction: column
</style>
