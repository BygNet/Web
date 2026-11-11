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
  messageUnreadCount,
  subscribeToMessagesRealtime,
} from '@/data/messages'
import {
  fetchNotifications,
  inboxUnreadCount,
  loadNotificationReadState,
} from '@/data/notifications'
import { getPushPermissionState, syncPushSubscription } from '@/data/pushAlerts'
import { loadTheme } from '@/data/themes'
import {
  isDisconnected,
  showingCookieBanner,
  showingNotificationsModal,
  showingReportPopup,
} from '@/data/visibility'
import { syncAppBadge } from '@/utils/appBadge'
import { consoleWarn } from '@/utils/consoleWarn'
import { useEnv } from '@/utils/env'
import { getFlag } from '@/utils/setUserFlag'
import CreateView from '@/views/CreateView.vue'
import ReportView from '@/views/ReportView.vue'
import { useHead } from '#imports'
import VStack from '~/components/layout/VStack.vue'
import { taskList } from '~/data/tasks.ts'
import { title } from '~/data/title.ts'

const pushPermission: Ref<NotificationPermission | 'unsupported'> =
  ref('unsupported')
const activeAccountKey = computed(() => auth.activeAccountId ?? 'guest')
const appBadgeCount = computed(
  () => messageUnreadCount.value + inboxUnreadCount.value
)
const canEnablePush = computed(() => {
  return (
    pushPermission.value === 'default' || pushPermission.value === 'granted'
  )
})
const pushEnabled = computed(() => pushPermission.value === 'granted')

const loadingState: Ref<'loading' | 'preparing' | 'ready'> = ref('loading')

const AppVersion = __AppVersion
title.value = ''

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

taskList.value.push('loading app')
onMounted(async () => {
  loadingState.value = 'preparing'

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

  consoleWarn()
  taskList.value.remove('loading app')
  loadingState.value = 'ready'
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

watch(
  appBadgeCount,
  count => {
    void syncAppBadge(count)
  },
  { immediate: true }
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

  <div class="appShell">
    <NuxtLayout>
      <template v-if="loadingState != 'ready'">
        <VStack class="bygLoaderContainer">
          <img src="/logos/BygLogo.png" alt="Byg Logo" class="bygLogoLoader" />

          <h3 v-if="loadingState == 'loading'">
            Byg {{ AppVersion }} is Loading...
          </h3>
          <h3 v-else-if="loadingState == 'preparing'">
            Byg {{ AppVersion }} is Preparing...
          </h3>
        </VStack>
      </template>

      <ClientOnly v-else>
        <Transition name="app" appear>
          <NuxtPage :key="activeAccountKey" />
        </Transition>
      </ClientOnly>
    </NuxtLayout>
  </div>
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

.app-enter-active,
.app-leave-active
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease

.app-enter-from
  opacity: 0
  transform: translateY(8px)
  filter: blur(4px)

.app-leave-to
  opacity: 0
  transform: translateY(-4px)
  filter: blur(2px)

@media (prefers-reduced-motion: reduce)
  .app-enter-active,
  .app-leave-active
    transition: opacity 120ms ease

  .app-enter-from,
  .app-leave-to
    transform: none
    filter: none

.bygLoaderContainer
  min-height: 100vh
  align-items: center !important
  justify-content: center !important

  .bygLogoLoader
    width: 5rem
    height: 5rem
    animation: logoLoading 2s infinite

@keyframes logoLoading
  0%
    scale: 1
  60%
    scale: 0.9
    opacity: 0.6
  100%
    scale: 1

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
