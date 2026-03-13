<script setup lang="ts">
  import HStack from '@/components/layout/HStack.vue'
  import { showingNavigation } from '@/data/visibility.ts'

  defineProps<{
    title: string
  }>()

  showingNavigation.value = false

  // use dark color theme
  document.documentElement.classList.add('dark')
</script>

<template>
  <div class="bygEmbedShell">
    <HStack class="embedTitle fullWidth">
      <img src="/logos/BygLogo.png" alt="Byg Logo" class="logo" />
      <h2>{{ title }}</h2>
    </HStack>

    <div class="embedContent">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .bygEmbedShell
    padding: 0.75rem
    background: themes.$foregroundOpaque
    width: 100%
    height: 100%
    border-radius: 0
    gap: 0.5rem

    .embedTitle
      padding: 0.5rem 0.5rem 0

      .logo
        width: 2.5rem
        height: 2.5rem

    .embedContent
      background: themes.$backgroundColor
      width: 100%
      height: 100%
      overflow: scroll
      border-radius: 1.5rem
      padding: 0.75rem
</style>
