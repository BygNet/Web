<script setup lang="ts">
import type { BygAd } from '@bygnet/types'
import { computed, onMounted, type Ref, ref, watch } from 'vue'

import { resetActiveAccountState } from '@/auth/accountState'
import { auth } from '@/auth/session'
import ShareModal from '@/components/messages/ShareModal.vue'
import Byg2Modal from '@/components/modals/Byg2Modal.vue'
import CookieBanner from '@/components/modals/CookieBanner.vue'
import NotificationsModal from '@/components/modals/NotificationsModal.vue'
import DesktopNav from '@/components/nav/DesktopNav.vue'
import MobileNav from '@/components/nav/MobileNav.vue'
import TitleView from '@/components/nav/TitleView.vue'
import { adCache } from '@/data/caches'
import { loadNotificationReadState } from '@/data/notifications'
import {
  getPushPermissionState,
  syncPushSubscription,
} from '@/data/pushAlerts'
import { showingShareModal } from '@/data/share'
import { loadTheme } from '@/data/themes'
import {
  blurContent,
  showingCookieBanner,
  showingCreateModal,
  showingNavigation,
  showingReportPopup,
} from '@/data/visibility'
import { consoleWarn } from '@/utils/consoleWarn'
import { useEnv } from '@/utils/env'
import { getFlag } from '@/utils/setUserFlag'
import CreateView from '@/views/CreateView.vue'
import { Icon } from '@iconify/vue'
import ReportView from '@/views/ReportView.vue'

const showingByg2Alpha: Ref<boolean> = ref(getFlag('showByg2Alpha', true))
const pushPermission: Ref<NotificationPermission | 'unsupported'> =
  ref('unsupported')
const showingNotificationsModal: Ref<boolean> = ref(false)
const activeAccountKey = computed(() => auth.activeAccountId ?? 'guest')
const canEnablePush = computed(() => {
  return (
    pushPermission.value === 'default' || pushPermission.value === 'granted'
  )
})
const pushEnabled = computed(() => pushPermission.value === 'granted')
const loadingApp: Ref<boolean> = ref(true)

onMounted(async () => {
  loadingApp.value = false

  consoleWarn()
  loadTheme()
  pushPermission.value = getPushPermissionState()
  showingCookieBanner.value = getFlag('showCookieBanner', true)

  if (canEnablePush.value && !pushEnabled.value && auth.token) {
    showingNotificationsModal.value = true
  }

  const adsRes: Response = await fetch(`${useEnv().adsBase}/index.json`)
    adCache.value = (await adsRes.json()) as BygAd[]
})

watch(
  () => auth.activeAccountId,
  async (next, previous) => {
    if (next === previous) return
    resetActiveAccountState()
    loadNotificationReadState()
    if (!auth.token) return
    try {
      await syncPushSubscription()
    } catch (error) {
      console.error('Push sync failed after account change', error)
    }
  }
)
</script>

<template>
  <div class="loadingView" v-if="loadingApp">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity="0.25"/><path fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg>
    <h1>Byg is Loading...</h1>
  </div>

  <ClientOnly>
    <CreateView v-if="showingCreateModal" />
    <ReportView v-if="showingReportPopup" />
    <ShareModal v-if="showingShareModal" />
    <Byg2Modal v-if="showingByg2Alpha" @close="showingByg2Alpha = false" />
    <CookieBanner
      v-if="showingCookieBanner"
      @close="showingCookieBanner = false"
    />
    <NotificationsModal
      v-if="showingNotificationsModal && !showingByg2Alpha"
      @close="showingNotificationsModal = false"
    />
  </ClientOnly>

  <DesktopNav
    class="blurrable"
    v-if="showingNavigation"
    :class="{ blurred: blurContent }"
  />
  <main class="blurrable" :class="{ blurred: blurContent }">
    <TitleView v-if="showingNavigation" />
    <NuxtPage :key="activeAccountKey" />
    <MobileNav v-if="showingNavigation" />
  </main>
</template>

<style scoped lang="sass">
  @use "@/styles/variables"
  @use "@/styles/themes"

  .loadingView
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    justify-content: center
    background: themes.$backgroundColor
    z-index: 1000

    svg
      width: 4rem
      height: 4rem

  main
    display: flex
    flex-direction: column
    align-items: center
    flex-grow: 3
    height: 100dvh
    width: 100%
    padding: 0
    margin: 0 auto
    gap: 0.5rem
    overflow-y: scroll
    scrollbar-width: none

  .blurrable
    transition: 0.1s ease

    &.blurred
      filter: blur(0.5rem)

  @media (max-width: variables.$mobileWidth)
    main
      width: 100%
</style>
