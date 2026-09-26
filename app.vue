<script setup lang="ts">
  import type { BygAd } from '@bygnet/types'
  import { computed, onMounted, onUnmounted, type Ref, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { resetActiveAccountState } from '@/auth/accountState'
  import { auth } from '@/auth/session'
  import ShareModal from '@/components/messages/ShareModal.vue'
  import CookieBanner from '@/components/modals/CookieBanner.vue'
  import NotificationsModal from '@/components/modals/NotificationsModal.vue'
  import { adCache } from '@/data/caches'
  import {
    fetchMessageThreads,
    subscribeToMessagesRealtime,
  } from '@/data/messages'
  import {
    fetchNotifications,
    loadNotificationReadState,
  } from '@/data/notifications'
  import {
    getPushPermissionState,
    syncPushSubscription,
  } from '@/data/pushAlerts'
  import { loadTheme } from '@/data/themes'
  import {
    isDisconnected,
    showingCookieBanner,
    showingNotificationsModal,
    showingReportPopup,
  } from '@/data/visibility'
  import { consoleWarn } from '@/utils/consoleWarn'
  import { useEnv } from '@/utils/env'
  import { getFlag } from '@/utils/setUserFlag'
  import CreateView from '@/views/CreateView.vue'
  import ReportView from '@/views/ReportView.vue'
  import { useHead } from '#imports'

  const pushPermission: Ref<NotificationPermission | 'unsupported'> =
    ref('unsupported')
  const activeAccountKey = computed(() => auth.activeAccountId ?? 'guest')
  const canEnablePush = computed(() => {
    return (
      pushPermission.value === 'default' || pushPermission.value === 'granted'
    )
  })
  const pushEnabled = computed(() => pushPermission.value === 'granted')

  const { locale } = useI18n()
  const manifestHref = computed(() => {
    const code = locale.value || 'en'
    return `/manifest.${code}.webmanifest`
  })

  const theme = useCookie<string>('bygTheme')
  const themeClass = theme.value ?? 'auto'

  const wallpaperMode = useCookie<boolean>('bygWallpaperMode', {
    default: () => false,
  })

  const wallpaperUrl = useCookie<string>('bygWallpaperUrl', {
    default: () => '',
  })

  let stopMessageRealtime: (() => void) | null = null
  let pingInterval: ReturnType<typeof setInterval> | null = null
  let pingInProgress = false

  async function pingApi(): Promise<void> {
    if (pingInProgress) return

    pingInProgress = true

    try {
      const { apiBase } = useEnv()

      const response = await fetch(`${apiBase}/ping`, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        throw new Error(`Ping failed: ${response.status}`)
      }

      isDisconnected.value = false
    } catch {
      isDisconnected.value = true
    } finally {
      pingInProgress = false
    }
  }

  function startConnectionMonitor(): void {
    stopConnectionMonitor()

    void pingApi()

    pingInterval = setInterval(() => {
      void pingApi()
    }, 15_000)
  }

  function stopConnectionMonitor(): void {
    if (pingInterval !== null) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  function syncMessageRealtime(): void {
    stopMessageRealtime?.()
    stopMessageRealtime = null

    if (!auth.token) {
      isDisconnected.value = false
      return
    }

    void fetchMessageThreads({ force: true })

    stopMessageRealtime = subscribeToMessagesRealtime({
      onEvent: event => {
        // Any realtime event proves that the realtime connection is alive.
        isDisconnected.value = false

        if (event.type === 'notification:new') {
          void fetchNotifications({ force: true })
        }
      },

      onConnectedChange: connected => {
        isDisconnected.value = !connected
      },
    })
  }

  useHead(() => ({
    htmlAttrs: {
      class: `${themeClass} ${wallpaperMode.value ? 'clear' : 'color'}`,
      style: {
        '--wallpaper-url': wallpaperUrl.value
          ? `url("${wallpaperUrl.value}")`
          : 'none',
      },
    },
  }))

  useHead(() => ({
    link: [ { rel: 'manifest', href: manifestHref.value } ],
  }))

  onMounted(async () => {
    consoleWarn()
    pushPermission.value = getPushPermissionState()
    showingCookieBanner.value = getFlag('showCookieBanner', true)

    loadTheme()
    loadNotificationReadState()
    fetchNotifications().catch(() => undefined)

    syncMessageRealtime()
    startConnectionMonitor()

    if (canEnablePush.value && !pushEnabled.value && auth.token) {
      showingNotificationsModal.value = true
    }

    const adsRes: Response = await fetch(`${useEnv().adsBase}/index.json`)
    adCache.value = (await adsRes.json()) as BygAd[]
  })

  onUnmounted(() => {
    stopMessageRealtime?.()
    stopMessageRealtime = null
    stopConnectionMonitor()
  })

  watch(
    () => auth.activeAccountId,
    async (next, previous) => {
      if (next === previous) return
      resetActiveAccountState()
      loadNotificationReadState()
      syncMessageRealtime()
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
  <ClientOnly>
    <CreateView />
    <ReportView v-if="showingReportPopup" />
    <ShareModal />
    <CookieBanner
      v-if="showingCookieBanner"
      @close="showingCookieBanner = false"
    />
    <NotificationsModal @close="showingNotificationsModal = false" />
  </ClientOnly>

  <div class="wallpaper" aria-hidden="true" v-if="wallpaperMode" />
  <span class="yandexTag" style="display: none">a38l7prussk7odyw</span>

  <Transition name="app" appear>
    <div class="appShell">
      <NuxtLayout>
        <NuxtPage :key="activeAccountKey" />
      </NuxtLayout>
    </div>
  </Transition>
</template>

<!--Unscoped due to layouts-->
<style lang="sass">
  @use "@/styles/variables"

  .wallpaper
    position: fixed
    inset: 0
    z-index: -1
    pointer-events: none
    background-image: var(--wallpaper-url)
    background-position: center
    background-size: cover
    background-repeat: no-repeat
    animation: wallIn 0.3s ease forwards

  @keyframes wallIn
    from
      scale: 0.8
      opacity: 0
      border-radius: 2rem

    to
      scale: 1
      opacity: 0.3
      border-radius: 0

  .appShell
    display: flex
    flex-direction: row
    width: 100vw
    height: 100dvh

  .app-enter-active
    transition: opacity 0.4s ease, transform 0.4s ease

  .app-enter-from
    opacity: 0
    transform: scale(1.2)

  .app-enter-to
    opacity: 1
    transform: scale(1)

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

  @media (max-width: variables.$mobileWidth)
    .appShell
      flex-direction: column
    main
      width: 100%
</style>
