<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed } from 'vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import UsernameView from '@/components/posts/UsernameView.vue'
  import type { BygNotification } from '@/types/notifications'
  import { formatDate } from '@/utils/formatters.ts'

  const props = defineProps<{
    notification: BygNotification
    unread?: boolean
  }>()

  const notificationIcon = computed(() => {
    switch (props.notification.type) {
      case 'follow':
        return 'solar:user-check-line-duotone'
      case 'image_comment':
        return 'solar:gallery-wide-line-duotone'
      case 'post_mention':
        return 'solar:at-line-duotone'
      case 'comment_mention':
        return 'solar:chat-round-line-line-duotone'
      case 'message':
        return 'solar:chat-round-line-line-duotone'
      case 'post_comment':
      default:
        return 'solar:chat-round-line-line-duotone'
    }
  })
</script>

<template>
  <RouterLink :to="notification.path" class="notificationLink">
    <HStack class="notificationItem" :class="{ unread: unread }">
      <Icon class="notificationIcon" :icon="notificationIcon" />

      <VStack class="notificationBody noSpace">
        <HStack class="autoSpace topLine">
          <UsernameView
            :name="notification.actorUsername"
            :avatar-url="notification.actorAvatarUrl"
            :subscription-state="notification.actorSubscriptionState"
          />
          <p class="light">{{ formatDate(notification.createdDate) }}</p>
        </HStack>

        <p>{{ notification.text }}</p>
      </VStack>
    </HStack>
  </RouterLink>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/utils"

  .notificationLink
    width: 100%

  .notificationItem
    @include utils.itemBackground
    @include utils.maxPostPaddedWidth

    width: 100%
    gap: 0.75rem
    align-items: flex-start
    cursor: pointer

    &.unread
      border: 0.1rem solid themes.$accentColor

    .notificationIcon
      width: 1.5rem
      height: 1.5rem
      margin-top: 0.1rem

    .notificationBody
      align-items: flex-start
      width: 100%

      .topLine
        align-items: flex-start
</style>
