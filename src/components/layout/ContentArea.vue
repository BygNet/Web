<script setup lang="ts">
  import { useAttrs } from 'vue'

  import MobileNav from '@/components/nav/MobileNav.vue'
  import VStack from "@/components/layout/VStack.vue";

  const attrs = useAttrs()

  defineProps<{
    hideTermsLink?: boolean
  }>()
</script>

<template>
  <div class="contentArea" v-bind="attrs">
    <VStack>
      <p>Ads</p>
      <div class="light" id="container-0088a88d3d9e747d59d22c4ea55fa11d" />
    </VStack>

    <slot />

    <p class="light" v-if="!hideTermsLink">
      To use this platform, you agree to the
      <RouterLink to="/terms" class="prominentLink">Terms of Service</RouterLink
      >.
    </p>
  </div>
  <MobileNav />
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    min-height: 100vh
</style>
