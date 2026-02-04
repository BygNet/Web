<script setup lang="ts">
  import '@/utils/randomElement.ts'

  import type { BygAd } from '@bygnet/types'
  import { onMounted } from 'vue'

  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import TitleView from '@/components/nav/TitleView.vue'
  import { adCache } from '@/data/caches.ts'
  import { loadTheme } from '@/data/themes.ts'
  import { showingCreateModal, showingReportPopup } from '@/data/visibility.ts'
  import { consoleWarn } from '@/utils/consoleWarn.ts'
  import CreateView from '@/views/CreateView.vue'
  import ReportView from '@/views/ReportView.vue'

  onMounted(async () => {
    consoleWarn()
    loadTheme()

    const adsRes: Response = await fetch(
      `${import.meta.env.VITE_ADS_BASE}/index.json`
    )
    adCache.value = (await adsRes.json()) as BygAd[]
  })
</script>

<template>
  <CreateView v-if="showingCreateModal" />
  <ReportView v-if="showingReportPopup" />

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
    max-width: 65rem
    padding: 0 calc(var(--padding)/2)
    margin: 0 auto
    gap: 1rem
    overflow-y: scroll
    scrollbar-width: none

  @media (max-width: variables.$mobileWidth)
    main
      width: calc(100% - var(--padding)*2)
</style>
