<script setup lang="ts">
  import '@/utils/randomElement.ts'

  import type { BygAd } from '@bygnet/types'
  import { onMounted, type Ref, ref } from 'vue'

  import ShareModal from '@/components/messages/ShareModal.vue'
  import Byg2Modal from '@/components/modals/Byg2Modal.vue'
  import DesktopNav from '@/components/nav/DesktopNav.vue'
  import MobileNav from '@/components/nav/MobileNav.vue'
  import TitleView from '@/components/nav/TitleView.vue'
  import { adCache } from '@/data/caches.ts'
  import { showingShareModal } from '@/data/share'
  import { loadTheme } from '@/data/themes.ts'
  import {
    showingCreateModal,
    showingNavigation,
    showingReportPopup,
  } from '@/data/visibility.ts'
  import { consoleWarn } from '@/utils/consoleWarn.ts'
  import { getFlag } from '@/utils/setUserFlag.ts'
  import CreateView from '@/views/CreateView.vue'
  import ReportView from '@/views/ReportView.vue'

  const showingByg2Alpha: Ref<boolean> = ref(getFlag('showByg2Alpha', true))

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
  <Byg2Modal v-if="showingByg2Alpha" @close="showingByg2Alpha = false" />

  <DesktopNav v-if="showingNavigation" />
  <main>
    <TitleView v-if="showingNavigation" />
    <RouterView />
    <MobileNav v-if="showingNavigation" />
  </main>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"

  main
    display: flex
    flex-direction: column
    align-items: center
    flex-grow: 3
    height: 100dvh
    width: 100%
    padding: 0
    margin: 0 auto
    gap: 1rem
    overflow-y: scroll
    scrollbar-width: none

  @media (max-width: variables.$mobileWidth)
    main
      width: 100%
</style>
