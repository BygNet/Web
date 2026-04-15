<script setup lang="ts">
  import { Icon } from '@iconify/vue'

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
  }>()

  const formattedDate = new Date(
    props.thread.lastMessageDate
  ).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
</script>

<template>
  <button
    class="threadItem"
    :class="{ prominent: selected }"
    @click="emit('select')"
  >
    <HStack class="threadRow">
      <VStack class="threadMain">
        <HStack class="threadTitle">
          <img
            v-if="thread.avatarUrl"
            :src="thread.avatarUrl"
            :alt="`${thread.username}'s avatar`"
          />
          <Icon
            v-else
            class="avatarFallback"
            icon="solar:user-circle-line-duotone"
          />
          <p class="username">{{ thread.username }}</p>
          <Icon
            v-if="thread.subscriptionState !== 'free'"
            icon="solar:crown-star-line-duotone"
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
  </button>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  button
    width: 100%

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
