<script setup lang="ts">
  import { useAttrs } from 'vue'

  import MobileNav from '@/components/nav/MobileNav.vue'

  const attrs = useAttrs()

  defineProps<{
    hideTermsLink?: boolean
  }>()
</script>

<template>
  <div class="contentArea" v-bind="attrs">
    <slot />

    <p class="light" v-if="!hideTermsLink">
      To use this platform, you agree to the
      <RouterLink to="/terms" class="prominentLink">Terms of Service</RouterLink>.
    </p>
  </div>
  <MobileNav />
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    min-height: 100vh
</style>
