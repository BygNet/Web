<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { SketchPicker, tinycolor } from 'vue-color'

  import VStack from '~/components/layout/VStack.vue'
  import SettingsInput from '~/components/settings/SettingsInput.vue'

  const showingColorPicker = ref(false)
  const pickerContainerRef = ref<HTMLElement | null>(null)
  const buttonRef = ref<HTMLElement | null>(null)

  defineProps<{
    label: string
  }>()

  const value = defineModel<string>({ required: true, default: '#474888' })

  const pickerColor = computed({
    get: () => tinycolor(value.value),
    set: color => {
      value.value = tinycolor(color).toHexString()
    },
  })

  const cssColor = computed(() => value.value)

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as Node

    if (
      pickerContainerRef.value?.contains(target) ||
      buttonRef.value?.contains(target)
    ) {
      return
    }

    showingColorPicker.value = false
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
  })
</script>

<template>
  <VStack class="settingsColorInputContainer">
    <SettingsInput slotted :label="label">
      <button
        ref="buttonRef"
        :style="{ '--color': cssColor }"
        class="colorInput"
        @click="showingColorPicker = !showingColorPicker"
      >
        <Icon icon="solar:palette-round-line-duotone" />
      </button>
    </SettingsInput>

    <div ref="pickerContainerRef" class="pickerContainer">
      <SketchPicker
        class="settingsColorPicker"
        v-show="showingColorPicker"
        v-model:tinyColor="pickerColor"
        data-picker
        disable-alpha
      />
    </div>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .settingsColorInputContainer
    position: relative
    width: 100%

    .colorInput
      background: var(--color)

    .pickerContainer
      position: absolute
      z-index: 2
      top: 1rem
</style>
