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
  <VStack class="settingsGroup" :class="{ plain }">
    <slot />
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .settingsGroupTitle
    padding: 0 0.95rem

  .settingsGroup
    width: 100%
    margin-bottom: 0.75rem

    &:not(.plain)
      background: themes.$foregroundColor
      padding: 0.95rem
      border-radius: 1.5rem
</style>
