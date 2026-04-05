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
  import {
    blurContent,
    showingCookieBanner,
    showingCreateModal,
    showingNavigation,
    showingReportPopup,
  } from '@/data/visibility'
  import { consoleWarn } from '@/utils/consoleWarn'
  import { getAdsBaseUrl } from '@/utils/runtimeConfig'
  import { getFlag } from '@/utils/setUserFlag'
  import CreateView from '@/views/CreateView.vue'
  import ReportView from '@/views/ReportView.vue'
  import ContentArea from '~/components/layout/ContentArea.vue'
  import SkeletonText from '~/components/layout/skeletons/SkeletonText.vue'

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
  const pageLoaded: Ref<boolean> = ref(false)

  onMounted(async () => {
    consoleWarn()
    pageLoaded.value = true
    pushPermission.value = getPushPermissionState()
    showingCookieBanner.value = getFlag('showCookieBanner', true)

    if (canEnablePush.value && !pushEnabled.value && auth.token) {
      showingNotificationsModal.value = true
    }

    const adsBase = getAdsBaseUrl()
    if (!adsBase) return

    try {
      const adsRes: Response = await fetch(`${adsBase}/index.json`)
      if (adsRes.ok) {
        adCache.value = (await adsRes.json()) as BygAd[]
      }
    } catch (error) {
      console.error('Failed to load ads index', error)
    }
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
  <div id="appLoading" v-if="!pageLoaded">
    <DesktopNav loading />

    <main>
      <TitleView force-title="Loading..." />

      <ContentArea>
        <SkeletonText :lines="100" />
      </ContentArea>

      <MobileNav />
    </main>
  </div>

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

  #appLoading
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: themes.$backgroundColor
    border-radius: 0
    z-index: 10000

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

  .blurrable
    transition: 0.1s ease

    &.blurred
      filter: blur(0.5rem)

  @media (max-width: variables.$mobileWidth)
    main
      width: 100%
</style>
