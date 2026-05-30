<script setup lang="ts">
  import VStack from '~/components/layout/VStack.vue'

  const props = defineProps<{
    label: string
    placeholder?: string
  }>()

  const value = defineModel<string>({
    required: true,
  })

  const { t } = useI18n()
</script>

<template>
  <VStack class="settingsTextArea">
    <label class="settingsInputLabel">{{ t(props.label) }}</label>
    <textarea
      class="plain"
      v-model="value"
      :placeholder="props.placeholder ? t(props.placeholder) : undefined"
    />
  </VStack>
</template>

<style scoped lang="sass">
  .settingsTextArea
    width: 100%

    textarea
      width: 100%
      resize: vertical
</style>
