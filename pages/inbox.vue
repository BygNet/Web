<script setup lang="ts">
  import {
    computed,
    onMounted,
    onUnmounted,
    type Ref,
    ref,
    watchEffect,
  } from 'vue'
  import { useI18n } from 'vue-i18n'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import NotificationItem from '@/components/notifications/NotificationItem.vue'
  import {
    fetchNotifications,
    isUnreadNotification,
    loadNotificationReadState,
    markNotificationsRead,
    unreadNotificationCount,
  } from '@/data/notifications'
  import { PageMetaByPath } from '@/data/pages'
  import {
    getPushPermissionState,
    syncPushSubscription,
  } from '@/data/pushAlerts'
  import { title } from '@/data/title'
  import type { BygNotification } from '@/types/notifications'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'

  definePageMeta({
    middleware: 'auth',
    showBackButton: true,
  })

  const { t } = useI18n()
  const pageMeta = PageMetaByPath['/inbox']!

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })
  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })

  const notifications: Ref<BygNotification[]> = ref([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const pushPermission: Ref<NotificationPermission | 'unsupported'> =
    ref('unsupported')
  const pushMessage: Ref<string | null> = ref(null)
  const enablingPush: Ref<boolean> = ref(false)
  const unreadCount = computed(() =>
    unreadNotificationCount(notifications.value)
  )
  const canEnablePush = computed(() => {
    return (
      pushPermission.value === 'default' || pushPermission.value === 'granted'
    )
  })
  const pushEnabled = computed(() => pushPermission.value === 'granted')
  let interval: number | undefined

  async function loadNotifications(
    options: { force?: boolean } = {}
  ): Promise<void> {
    if (!options.force) {
      loading.value = true
    }
    error.value = null

    try {
      notifications.value = await fetchNotifications(options)
    } catch {
      error.value = 'Failed to load inbox.'
    } finally {
      loading.value = false
    }
  }

  function markAllRead(): void {
    markNotificationsRead()
  }

  function isUnread(notification: BygNotification): boolean {
    return isUnreadNotification(notification)
  }

  async function enablePushAlerts(): Promise<void> {
    if (!canEnablePush.value || enablingPush.value) return
    enablingPush.value = true
    pushMessage.value = null

    try {
      const didEnable = await syncPushSubscription({
        requestPermission: true,
      })
      pushPermission.value = getPushPermissionState()
      pushMessage.value = didEnable
        ? t('common.pushEnabled')
        : t('common.pushNotEnabled')
    } catch {
      pushPermission.value = getPushPermissionState()
      pushMessage.value = t('common.pushEnableFailed')
    } finally {
      enablingPush.value = false
    }
  }

  onMounted(async () => {
    loadNotificationReadState()
    pushPermission.value = getPushPermissionState()
    if (pushPermission.value === 'granted') {
      syncPushSubscription().catch(error => {
        console.error('Push sync failed on notifications page', error)
      })
    }
    await loadNotifications()
    interval = window.setInterval(() => {
      loadNotifications({ force: true })
    }, 30000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })
</script>

<template>
  <ContentArea class="notificationsPage">
    <HStack class="fullWidth controls">
      <HStack class="controlButtons fullWidth autoSpace">
        <HStack>
          <button
            v-if="canEnablePush && !pushEnabled"
            @click="enablePushAlerts"
            :disabled="enablingPush"
            class="prominent"
          >
            <Icon name="solar:bell-bing-line-duotone" />
            {{
              enablingPush ? t('common.enabling') : t('common.enablePushAlerts')
            }}
          </button>

          <button class="spinIcon" @click="loadNotifications({ force: true })">
            <Icon name="solar:refresh-line-duotone" />
            {{ t('common.refresh') }}
          </button>
        </HStack>

        <button
          @click="markAllRead"
          :disabled="unreadCount < 1"
          class="prominent"
        >
          <Icon name="solar:check-read-line-duotone" />
          {{ t('common.markAllRead') }} ({{ unreadCount }})
        </button>
      </HStack>
    </HStack>
    <p v-if="pushMessage" class="light pushMessage">
      {{ pushMessage }}
    </p>

    <EmptyState v-if="loading" :message="t('common.loadingNotifications')" />
    <ErrorState v-else-if="error" :message="error" />

    <EmptyState
      v-else-if="notifications.length < 1"
      :message="t('common.noNotificationsYet')"
    />

    <VStack v-else class="notificationsList">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :unread="isUnread(notification)"
      />
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .notificationsPage, .notificationsList
    width: 100%

  .controls
    margin-bottom: 0.75rem
    justify-content: flex-end

    .controlButtons
      gap: 0.5rem

  .pushMessage
    width: 100%
    text-align: right
</style>
