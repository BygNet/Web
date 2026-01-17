<script setup lang="ts">
  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import TitleView from '@/components/nav/TitleView.vue'
</script>

<template>
  <DesktopNav />
  <main>
    <TitleView />
    <h1>Byg Platform is currently locked.</h1>
    <p>Thanks for using Byg! Come back soon!</p>
    <RouterView />
  </main>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"

  main
    flex-grow: 1
    height: 100dvh
    width: 100%
    max-width: 55rem
    padding: 0 calc(var(--padding)/2)
    margin: 0 auto
    gap: 1rem
    overflow-y: scroll
    scrollbar-width: none

  @media (max-width: variables.$mobileWidth)
    main
      width: calc(100% - var(--padding)*2)
</style>
