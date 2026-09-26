<script setup lang="ts">
  import DesktopNav from '~/components/nav/DesktopNav.vue'
  import MobileNav from '~/components/nav/MobileNav.vue'
  import TitleView from '~/components/nav/TitleView.vue'

  let observer: ResizeObserver | undefined

  onMounted(() => {
    const element = document.querySelector<HTMLElement>('#appHeader')

    if (!element) return

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--headerHeight',
        `${element.offsetHeight}px`
      )
    }

    observer = new ResizeObserver(updateHeight)
    observer.observe(element)

    updateHeight()
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
</script>

<template>
  <DesktopNav />

  <main class="defaultLayout">
    <TitleView />
    <slot />
    <MobileNav />
  </main>
</template>

<style lang="sass">
  .defaultLayout
    .contentArea
      margin: 0 0 var(--padding) !important
      max-width: 65rem !important
</style>
