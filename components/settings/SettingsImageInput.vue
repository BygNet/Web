<script setup lang="ts">
  import VStack from '~/components/layout/VStack.vue'

  const value = defineModel<string>({ required: true })

  defineProps<{
    label: string
    placeholder?: string
    noBorder?: boolean
  }>()

  const { t } = useI18n()
</script>

<template>
  <VStack class="settingsImageInput settingsBorder" :class="{ noBorder }">
    <SettingsInput
      v-model="value"
      :placeholder="placeholder"
      :label="label"
      type="url"
      no-border
    />
    <img
      v-if="value"
      :src="value"
      class="settingsImageInputImage"
      :alt="t(label)"
    />
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .settingsImageInput
    width: 100%
    border-radius: 0

    .settingsImageInputImage
      max-width: 10rem
      max-height: 10rem
      border-radius: 1rem
</style>
