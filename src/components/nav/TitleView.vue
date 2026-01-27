<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ProgressiveBlur } from 'vue-progressive-blur'
  import { useRouter } from 'vue-router'

  import HStack from '@/components/layout/HStack.vue'
  import { showBackButton, title } from '@/data/title.ts'

  const router = useRouter()
</script>

<template>
  <header class="titleView">
    <HStack class="titleViewContent">
      <button @click="router.back()" v-if="showBackButton" class="backButton">
        <Icon icon="solar:arrow-left-line-duotone" />
      </button>
      <h2>{{ title }}</h2>
    </HStack>

    <div class="titleBlurContainer">
      <ProgressiveBlur class="titleBlur" :blur="16" :border-radius="0" />
    </div>
  </header>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .titleView
    position: sticky
    top: 0
    z-index: 100
    background: linear-gradient(to bottom, themes.$backgroundColor, transparent)
    padding: 0.5rem 0.5rem 1rem
    margin-bottom: -1rem

    .titleViewContent
      z-index: 102
      margin-top: calc(env(safe-area-inset-top) + 0.5rem)

  button.backButton
    padding: 0.75rem

    svg
      width: 1.5rem !important
      height: 1.5rem !important

  .titleBlurContainer
    position: absolute
    top: 0
    bottom: -1.5rem
    left: 0
    right: 0
    z-index: -1

    .titleBlur
      transform: rotate(180deg)
</style>
