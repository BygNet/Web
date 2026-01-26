<script setup lang="ts">
  import { onMounted } from 'vue'

  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import TitleView from '@/components/nav/TitleView.vue'
  import { loadTheme } from '@/data/themes.ts'
  import { showingCreateModal } from '@/data/visibility.ts'
  import { consoleWarn } from '@/utils/consoleWarn.ts'
  import CreateView from '@/views/CreateView.vue'

  onMounted(() => {
    consoleWarn()
    loadTheme()
  })
</script>

<template>
  <CreateView v-if="showingCreateModal" />

  <DesktopNav />
  <main>
    <TitleView />
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
