<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useI18n } from 'vue-i18n'
  import { ProgressiveBlur } from 'vue-progressive-blur'

  import HStack from '@/components/layout/HStack.vue'
  import { taskList } from '@/data/tasks'
  import { showBackButton, title } from '@/data/title'
  import { useRoute } from '#app'
  import {isActive} from "~/utils/isActive";

  const localePath = useLocalePath()
  const route = useRoute()
  const { t } = useI18n()

  function goBack() {
    window.history.back()
  }
</script>

<template>
  <header class="titleView">
    <HStack class="titleViewContent autoSpace">
      <HStack class="titleMain">
        <button @click="goBack()" v-if="showBackButton" class="backButton">
          <Icon icon="solar:arrow-left-line-duotone" />
        </button>
        <h2>{{ title }}</h2>

        <div class="tasksIndicator" v-if="taskList.length > 0">
          <p class="tasksCount" v-if="taskList.length > 1">
            {{ taskList.length }}
          </p>
          <Icon icon="svg-spinners:90-ring-with-bg" class="tasksLoader" />
        </div>
      </HStack>

      <button
        class="alertsButton"
        :class="{
          prominent: isActive(route.path, '/inbox'),
        }"
        @click="navigateTo(localePath('/inbox'))"
        :aria-label="t('ui.nav.openAlerts')"
      >
        <Icon
          :icon="
           isActive(route.path, '/inbox')
              ? 'solar:inbox-line-bold-duotone'
              : 'solar:inbox-line-line-duotone'
          "
        />
      </button>
    </HStack>

    <div class="titleMaskContainer" />
    <div class="titleBlurContainer">
      <ProgressiveBlur class="titleBlur" :blur="24" :border-radius="0" />
    </div>
  </header>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"
  @use "@/styles/utils"
  @use "@/styles/variables"

  .titleView
    width: 100%
    display: flex
    justify-content: center
    position: sticky
    top: 0
    z-index: 100
    padding: 0.5rem 0

    .titleViewContent
      z-index: 102
      margin-top: calc(env(safe-area-inset-top) + 0.5rem)
      gap: 0.75rem
      flex-wrap: nowrap
      width: 65rem
      padding: 0 var(--padding)

    .titleMain
      gap: 0.5rem
      flex-shrink: 1
      flex-wrap: nowrap
      min-width: 0

      h2
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
        min-width: 0
        flex-grow: 1
        flex-shrink: 1
        max-width: 100%

      .tasksIndicator
        position: relative

        .tasksCount
          position: absolute
          top: -0.25rem
          right: -0.25rem
          background: themes.$accentColor
          padding: 0.25rem
          font-size: 0.75rem
          border-radius: 10rem

        .tasksLoader
          width: 1.5rem
          height: 1.5rem

  button.backButton
    padding: 0.75rem

    svg
      width: 1.5rem !important
      height: 1.5rem !important

  button.alertsButton
    padding: 0.75rem

    svg
      width: 1.5rem !important
      height: 1.5rem !important

  .titleMaskContainer
    background: linear-gradient(to bottom, themes.$backgroundColor, transparent)
    opacity: 0.7
    z-index: -1

  .titleBlurContainer
    z-index: -2

  .titleBlurContainer, .titleMaskContainer
    position: absolute
    top: 0
    bottom: -1.5rem
    left: 0
    right: 0
    border-radius: 0

    .titleBlur
      transform: rotate(180deg)
</style>
