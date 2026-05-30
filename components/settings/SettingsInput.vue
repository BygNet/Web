<script setup lang="ts">
  import { type HTMLInputType } from '@/types/html'
  import HStack from '~/components/layout/HStack.vue'

  defineProps<{
    type?: HTMLInputType
    label: string
    placeholder?: string
    noBorder?: boolean
    slotted?: boolean
  }>()

  const { t } = useI18n()

  const value = defineModel<string>({
    required: false,
  })
</script>

<template>
  <HStack class="settingsInput settingsBorder" :class="{ noBorder }">
    <label class="settingsInputLabel">{{ t(label) }}</label>

    <input
      v-if="!slotted"
      class="settingsInputInput plain"
      :type="type"
      :placeholder="placeholder"
      v-model="value"
    />
    <slot v-else />
  </HStack>
</template>

<!-- UNSCOPED styles for SettingsTextArea/SettingsInput/SettingsImageInput -->
<style lang="sass">
  @use "@/styles/utils"

  .settingsInputLabel
    flex-shrink: 0
    font-weight: bold
    font-size: 0.85rem
    width: fit-content

  @media (min-width: 40rem)
    .settingsInputLabel
      font-size: 1rem !important

  .settingsBorder:not(.noBorder)
    padding-bottom: 0.75rem !important
    border-radius: 0
    @include utils.listItemBorder
</style>

<style scoped lang="sass">
  .settingsInput
    width: 100%
    justify-content: space-between
    flex-wrap: nowrap
    padding: 0.35rem 0

    .settingsInputInput
      flex-grow: 1
      flex-shrink: 1
      text-align: end
      text-overflow: ellipsis
      min-width: 0
</style>
