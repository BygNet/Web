<script setup lang="ts">
  import FullscreenCover from '@/components/layout/FullscreenCover.vue'

  defineProps<{
    visible?: boolean
  }>()

  const attrs = useAttrs()
</script>

<template>
  <Transition name="modal" appear>
    <FullscreenCover v-if="visible !== false" class="modalCover" v-bind="attrs">
      <div class="modalContent">
        <slot />
      </div>
    </FullscreenCover>
  </Transition>
</template>

<style lang="sass">
  .modalCover
    --margin: 1.5rem
    z-index: 500
    padding: var(--margin) 0
    backdrop-filter: blur(0.5rem)
    background: rgb(62 62 62 / 0.3)
    overflow: visible

    .modalContent
      width: fit-content
      min-width: 18rem
      max-width: 50rem
      margin-top: env(safe-area-inset-top)
      max-height: calc(100vh - var(--padding)*2 - env(safe-area-inset-top) - env(safe-area-inset-bottom))
      margin-bottom: var(--tabBarHeight)
      border-radius: 1.5rem
      overflow: scroll

  .modal-enter-active,
  .modal-leave-active
    transition: opacity 0.25s ease

    .modalContent
      transition: transform 0.25s ease, opacity 0.25s ease

  .modal-enter-from,
  .modal-leave-to
    opacity: 0

    .modalContent
      transform: translateY(2rem)
      opacity: 0

  .modal-enter-to,
  .modal-leave-from
    opacity: 1

    .modalContent
      transform: translateY(0)
      opacity: 1
</style>
