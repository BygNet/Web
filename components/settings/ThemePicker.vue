<script setup lang="ts">
  import type { BygProfile } from '@bygnet/types'
  import { onUnmounted, type Ref,ref } from 'vue'

  import {
    applyProfileThemeToDocument,
    clearDocumentProfileTheme,
  } from '@/utils/profileTheme'
  import HStack from '~/components/layout/HStack.vue'
  import VStack from '~/components/layout/VStack.vue'
  import { BygThemes, currentThemeKey, setTheme } from '~/data/themes.ts'

  const { t } = useI18n()

  const isPreviewingBaseTheme: Ref<boolean> = ref(false)
  let themePreviewTimeout: number | null = null

  const props = defineProps<{
    profile?: BygProfile | null
    full?: boolean
  }>()

  const emit = defineEmits([ 'previewing', 'done-previewing' ])

  function previewAndSetTheme(theme: (typeof BygThemes)[number]) {
    if (themePreviewTimeout != null) {
      window.clearTimeout(themePreviewTimeout)
    }

    isPreviewingBaseTheme.value = true
    emit('previewing')
    setTheme(theme)
    clearDocumentProfileTheme()

    themePreviewTimeout = window.setTimeout(() => {
      isPreviewingBaseTheme.value = false

      if (props.profile) {
        applyProfileThemeToDocument(props.profile?.user.color)
      }
      themePreviewTimeout = null
      emit('done-previewing')
    }, 900)
  }

  onUnmounted(() => {
    if (themePreviewTimeout != null) {
      window.clearTimeout(themePreviewTimeout)
    }
  })
</script>

<template>
  <VStack class="appearanceSidebar" :class="{ full }">
    <HStack class="autoSpace header">
      <h2>{{ t('ui.profilePage.themes') }}</h2>
      <slot />
    </HStack>

    <VStack class="themeList">
      <HStack
        v-for="theme in BygThemes"
        class="bygTheme"
        @click="previewAndSetTheme(theme)"
      >
        <div
          class="previewCircle"
          :style="{ background: theme.colorPreview }"
          :class="{ selected: currentThemeKey === theme.key }"
        />

        <VStack class="themeInfo">
          <h4>{{ theme.title }}</h4>
          <p class="light">{{ theme.description }}</p>
        </VStack>
      </HStack>
    </VStack>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .appearanceSidebar
    --padding: 0.75rem
    --margin: 1rem

    padding: var(--padding)
    margin: var(--margin)

    border-radius: 1.5rem
    z-index: 200

    &:not(.full)
      position: fixed
      top: env(safe-area-inset-top)
      background: themes.$foregroundColor
      bottom: 0
      right: 0
      height: calc(100vh - var(--padding)*2 - var(--margin)*2 - var(--tabBarHeight) - env(safe-area-inset-top) - env(safe-area-inset-bottom))
      backdrop-filter: blur(0.5rem)
      width: fit-content
      max-width: 90vw
      animation: sidebarSlide 0.4s ease forwards

    &.full
      --margin: 0
      --padding: 0
      width: 100%

      .header
        display: none


  @keyframes sidebarSlide
    0%
      transform: translateX(100%)
    100%
      transform: none

  .themeList
    flex: 1
    min-height: 0
    overflow-y: auto
    flex-wrap: nowrap

    .bygTheme
      gap: 1rem
      cursor: pointer

      .previewCircle
        width: 2rem
        height: 2rem
        border-radius: 50%
        margin: 0.25rem

        &.selected
          outline: 0.25rem solid themes.$accentColor

      .themeInfo
        gap: 0
</style>
