<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, onMounted, onUnmounted, type Ref, ref } from 'vue'

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
  import {
    getPushPermissionState,
    syncPushSubscription,
  } from '@/data/pushAlerts'
  import { title } from '@/data/title.ts'
  import type { BygNotification } from '@/types/notifications'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Notifications'
  setHeadMeta({
    page: 'Notifications',
    subtitle: 'See recent follows and comments.',
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
      error.value = 'Failed to load notifications.'
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
        ? 'Push alerts enabled.'
        : 'Push alerts were not enabled.'
    } catch {
      pushPermission.value = getPushPermissionState()
      pushMessage.value = 'Failed to enable push alerts.'
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
      <HStack class="controlButtons">
        <button
          v-if="canEnablePush && !pushEnabled"
          @click="enablePushAlerts"
          :disabled="enablingPush"
          class="prominent"
        >
          <Icon icon="solar:bell-bing-line-duotone" />
          {{ enablingPush ? 'Enabling...' : 'Enable Push Alerts' }}
        </button>

        <button @click="loadNotifications({ force: true })">
          <Icon icon="solar:refresh-line-duotone" />
          Refresh
        </button>

        <button
          @click="markAllRead"
          :disabled="unreadCount < 1"
          class="prominent"
        >
          <Icon icon="solar:check-read-line-duotone" />
          Mark all read ({{ unreadCount }})
        </button>
      </HStack>
    </HStack>
    <p v-if="pushMessage" class="light pushMessage">{{ pushMessage }}</p>

    <EmptyState v-if="loading" message="Loading notifications." />
    <ErrorState v-else-if="error" :message="error" />

    <EmptyState
      v-else-if="notifications.length < 1"
      message="No notifications yet."
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
