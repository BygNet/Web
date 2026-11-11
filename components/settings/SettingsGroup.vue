<script setup lang="ts">
import VStack from '~/components/layout/VStack.vue'

defineProps<{
  title?: string
  plain?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <h3 class="settingsGroupTitle" v-if="title">{{ t(title) }}</h3>
  <VStack class="settingsGroup glowEffect" :class="{ plain }">
    <slot />
  </VStack>
</template>

<style scoped lang="sass">
.settingsGroupTitle
  padding: 0 0.95rem

.settingsGroup
  width: 100%
  margin-bottom: 0.75rem

  &:not(.plain)
    background: var(--foregroundColor)
    padding: 0.95rem
    border-radius: 1.75rem

.clear
  .settingsGroup:not(.plain)
    backdrop-filter: blur(0.75rem)
</style>
