<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import type { BygUserSuggestion } from '@/types/mentions'

  defineProps<{
    suggestions: BygUserSuggestion[]
  }>()

  const emit = defineEmits<{
    select: [username: string]
  }>()
</script>

<template>
  <VStack class="mentionSuggestions">
    <button
      v-for="user in suggestions"
      :key="user.id"
      class="mentionSuggestionItem"
      @click.prevent="emit('select', user.username)"
    >
      <HStack class="fullWidth autoSpace">
        <HStack class="noSpace mentionMain">
          <img
            v-if="user.avatarUrl"
            :src="user.avatarUrl"
            :alt="`${user.username}'s avatar`"
            class="suggestionAvatar"
          />
          <Icon
            v-else
            class="suggestionAvatar fallback"
            icon="solar:user-circle-line-duotone"
          />
          <p>@{{ user.username }}</p>
        </HStack>

        <Icon
          v-if="user.subscriptionState !== 'free'"
          icon="solar:crown-star-line-duotone"
        />
      </HStack>
    </button>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/utils"

  .mentionSuggestions
    flex-wrap: nowrap
    position: absolute
    width: 20rem
    border-radius: 1.5rem
    max-width: 100%
    max-height: 12rem
    overflow: scroll
    align-items: flex-start
    gap: 0.25rem
    padding: 0.5rem
    background: themes.$foregroundOpaque
    z-index: 1000

    .mentionSuggestionItem
      width: 100%
      justify-content: flex-start
      padding: 0.35rem 0.5rem

      .mentionMain
        gap: 0.4rem
        align-items: center

      .suggestionAvatar
        width: 1.2rem
        height: 1.2rem
        border-radius: 50%

        &.fallback
          border-radius: 0
</style>
