<script setup lang="ts">
  import DesktopNav from '~/components/nav/DesktopNav.vue'
  import MobileNav from '~/components/nav/MobileNav.vue'
  import TitleView from '~/components/nav/TitleView.vue'
  import { blurContent } from '~/data/visibility'
</script>

<template>
  <DesktopNav class="blurrable" :class="{ blurred: blurContent }" />

  <main class="blurrable defaultLayout" :class="{ blurred: blurContent }">
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
