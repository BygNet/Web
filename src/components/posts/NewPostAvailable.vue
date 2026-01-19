<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'

  defineEmits<{
    (e: 'click'): void
  }>()
</script>

<template>
  <div class="newPosts" @click="$emit('click')">
    <HStack>
      <Icon
        class="notiIcon"
        icon="solar:notification-unread-lines-line-duotone"
      />

      <VStack class="notiText">
        <h2>New Posts!</h2>
        <p class="light">Click to refresh.</p>
      </VStack>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .newPosts
    position: fixed
    align-items: flex-start
    padding: 1rem 1.5rem 1rem 1rem

    border-radius: 2rem
    background: themes.$foregroundColor
    border: 0.2rem solid themes.$foregroundColor
    backdrop-filter: blur(0.5rem)
    transition: 0.2s ease
    z-index: 100
    cursor: pointer
    animation: slideTop 0.3s forwards ease

    &:hover
      scale: 1.1
      transform: translateY(0.5rem)

    &:active
      transform: translateY(0)

  .notiIcon
    width: 2rem
    height: 2rem
    padding: 0 1rem 0 0

  .notiText
    gap: 0

  @keyframes slideTop
    0%
      top: calc(-100% - 2rem)

    100%
      top: 3.5rem
</style>
