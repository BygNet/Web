<script setup lang="ts">
import VStack from '@/components/layout/VStack.vue'

defineProps<{
  icon: string
  message: string
}>()
</script>

<template>
  <VStack class="emptyState">
    <div class="emptyIconContainer">
      <Icon :name="icon" class="emptyIcon" />
      <div class="xMark">
        <Icon name="mingcute:close-fill" class="xMarkIcon" />
      </div>
    </div>

    <h3>{{ message }}</h3>
  </VStack>
</template>

<style scoped lang="sass">
@use "@/styles/utils"

.emptyIconContainer
  position: relative
  margin: 1rem 0

  .emptyIcon
    width: 4rem
    height: 4rem

  .xMark
    @include utils.glowEffect

    position: absolute
    bottom: -0.5rem
    right: -0.5rem
    background: var(--foregroundColor)
    backdrop-filter: blur(0.25rem)
    padding: 0.5rem
    border-radius: 2rem

    .xMarkIcon
      width: 1.25rem
      height: 1.25rem
</style>
