<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '~/components/layout/HStack.vue'

  defineProps<{
    status: string
    enabled: boolean
    icon: string
    noBorder?: boolean
  }>()

  const { t } = useI18n()
</script>

<template>
  <HStack
    class="settingsStatusIndicator settingsBorder"
    :class="{ noBorder, enabled }"
  >
    <Icon class="icon" :icon="icon" />
    <p>{{ t(status) }}</p>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .settingsStatusIndicator
    width: 100%

    &.enabled.noBorder
      background: themes.$accentColor
      padding: 0.5rem
      margin: -0.5rem
      width: calc(100% + 1rem)
</style>
