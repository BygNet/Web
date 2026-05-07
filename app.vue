<script setup lang="ts">
  import type { BygAd } from '@bygnet/types'
  import { computed, onMounted, type Ref, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { resetActiveAccountState } from '@/auth/accountState'
  import { auth } from '@/auth/session'
  import ShareModal from '@/components/messages/ShareModal.vue'
  import CookieBanner from '@/components/modals/CookieBanner.vue'
  import NotificationsModal from '@/components/modals/NotificationsModal.vue'
  import { adCache } from '@/data/caches'
  import { loadNotificationReadState } from '@/data/notifications'
  import {
    getPushPermissionState,
    syncPushSubscription,
  } from '@/data/pushAlerts'
  import { showingShareModal } from '@/data/share'
  import {
    showingCookieBanner,
    showingCreateModal,
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
  const showingNotificationsModal: Ref<boolean> = ref(false)
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

  useHead({
    htmlAttrs: {
      class: themeClass,
    },
  })

  useHead(() => ({
    link: [ { rel: 'manifest', href: manifestHref.value } ],
  }))

  useHead({
    script: [
      {
        innerHTML: `
        (function() {
          const theme = document.cookie.match(/bygTheme=([^;]+)/)?.[1] || 'auto';
          if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
          }
        })();
      `,
      },
    ],
  })

  onMounted(async () => {
    consoleWarn()
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
  <ClientOnly>
    <CreateView v-if="showingCreateModal" />
    <ReportView v-if="showingReportPopup" />
    <ShareModal v-if="showingShareModal" />
    <CookieBanner
      v-if="showingCookieBanner"
      @close="showingCookieBanner = false"
    />
    <NotificationsModal
      v-if="showingNotificationsModal"
      @close="showingNotificationsModal = false"
    />
  </ClientOnly>

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
  @use "@/styles/themes"

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
