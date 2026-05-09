<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'

  import VStack from '@/components/layout/VStack.vue'

  const props = defineProps<{
    open: boolean
    title?: string
    anchor?: HTMLElement | null
  }>()

  const emit = defineEmits<{
    close: []
  }>()

  const menuRoot = ref<HTMLElement | null>(null)

  const positionStyle = computed(() => {
    const anchor = props.anchor

    if (!anchor) {
      return {}
    }

    const rect = anchor.getBoundingClientRect()

    return {
      top: `${rect.bottom + 8}px`,
      left: `${Math.max(16, rect.right - 288)}px`,
    }
  })

  function closeMenu(): void {
    emit('close')
  }

  function onPointerDown(event: PointerEvent): void {
    if (!props.open) return
    const target = event.target
    if (!(target instanceof Node)) return
    if (menuRoot.value?.contains(target)) return
    closeMenu()
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!props.open) return
    if (event.key === 'Escape') {
      closeMenu()
    }
  }

  watch(
    () => props.open,
    isOpen => {
      if (isOpen) {
        window.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('keydown', onKeyDown)
      } else {
        window.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('keydown', onKeyDown)
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('keydown', onKeyDown)
  })
</script>

<template>
  <VStack
    v-if="open"
    class="contextMenu background"
    ref="menuRoot"
    role="menu"
    :aria-label="title"
    :style="positionStyle"
  >
    <p v-if="title" class="contextMenuTitle light">
      {{ title }}
    </p>
    <slot />
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .contextMenu
    padding: 0.5rem
    background: themes.$foregroundColor
    backdrop-filter: blur(1rem)
    border-radius: 1.75rem
    gap: 0.25rem

    width: min(18rem, calc(100vw - 2rem))
    position: fixed
    top: 0
    left: 0
    z-index: 40
    align-items: stretch
    max-height: 30vh
    overflow: scroll
    flex-wrap: nowrap

  .contextMenuTitle
    font-size: 0.85rem
    margin: 0
    padding: 0 0.25rem
    letter-spacing: 0.02em
</style>
