<script setup lang="ts">
  import { computed } from 'vue'

  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import type { BygMessageThread } from '@/types/messages'

  const props = defineProps<{
    thread: BygMessageThread
    selected?: boolean
    typing?: boolean
  }>()

  const emit = defineEmits<{
    select: []
    info: []
  }>()

  const otherDirectMember = computed(() => {
    return props.thread.members.find(member => member.userId !== auth.user?.id)
  })
  const displayName = computed(() => {
    if (props.thread.type === 'group') {
      return props.thread.title ?? 'Group chat'
    }

    return otherDirectMember.value?.username ?? 'Direct chat'
  })
  const avatarUrl = computed(() => {
    return props.thread.type === 'direct'
      ? (otherDirectMember.value?.avatarUrl ?? null)
      : props.thread.imageUrl
  })
  const subscriptionState = computed(() => {
    return props.thread.type === 'direct'
      ? (otherDirectMember.value?.subscriptionState ?? 'free')
      : 'free'
  })
  const formattedDate = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(props.thread.lastMessageDate))
  )
</script>

<template>
  <HStack class="threadItem" :class="{ selected }" @click="emit('select')">
    <HStack class="threadRow">
      <VStack class="threadMain">
        <HStack
          class="threadTitle"
          @click.stop="thread.type === 'group' ? emit('info') : emit('select')"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="`${displayName}'s avatar`"
          />
          <Icon
            v-else-if="thread.type === 'direct'"
            class="avatarFallback"
            name="solar:user-circle-line-duotone"
          />
          <Icon
            v-else
            class="avatarFallback"
            name="solar:users-group-rounded-line-duotone"
          />

          <p class="username">{{ displayName }}</p>
          <Icon
            v-if="subscriptionState !== 'free'"
            name="solar:crown-star-line-duotone"
          />
        </HStack>

        <p class="light preview" v-if="!typing">
          {{ thread.lastMessagePreview }}
        </p>
        <p class="light preview typingText" v-else>Typing...</p>
      </VStack>

      <p class="light threadTime">
        {{ formattedDate }}
      </p>
    </HStack>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/utils"

  .threadItem
    border-radius: 0
    padding: 0.75rem
    width: 100%

    &:not(.selected)
      @include utils.listItemBorder

    &.selected
      border-radius: 1rem
      background: themes.$accentColor

    .threadRow
      width: 100%
      justify-content: space-between
      align-items: center
      flex-wrap: nowrap

      .threadMain
        gap: 0
        flex-grow: 1
        flex-shrink: 1
        min-width: 0

        .threadTitle
          img, .avatarFallback
            width: 2rem
            height: 2rem
            border-radius: 50%
            object-fit: cover

        .preview
          width: 100%
          text-align: start
          overflow: hidden
          text-overflow: ellipsis
          white-space: nowrap

      .threadTime
        flex-shrink: 0
        white-space: nowrap
</style>
