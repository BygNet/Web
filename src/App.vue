<script setup lang="ts">
  import '@/utils/randomElement.ts'

  import type { BygAd } from '@bygnet/types'
  import { onMounted } from 'vue'

  import ShareModal from '@/components/messages/ShareModal.vue'
  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import TitleView from '@/components/nav/TitleView.vue'
  import { adCache } from '@/data/caches.ts'
  import { showingShareModal } from '@/data/share'
  import { loadTheme } from '@/data/themes.ts'
  import {showingCreateModal, showingNavigation, showingReportPopup} from '@/data/visibility.ts'
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
  <ShareModal v-if="showingShareModal" />

  <DesktopNav v-if="showingNavigation" />
  <main :class="{ expanded: !showingNavigation }">
    <TitleView v-if="showingNavigation" />
    <RouterView />
  </main>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"

  main
    flex-grow: 1
    height: 100dvh
    width: 100%
    padding: 0 calc(var(--padding)/2)
    margin: 0 auto
    gap: 1rem
    overflow-y: scroll
    scrollbar-width: none

    &:not(.expanded)
      max-width: 65rem

  @media (max-width: variables.$mobileWidth)
    main
      width: calc(100% - var(--padding)*2)
</style>
