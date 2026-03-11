<script setup lang="ts">
  import { useAttrs } from 'vue'

  import { showingNavigation } from '@/data/visibility.ts'

  const attrs = useAttrs()

  defineProps<{
    hideTermsLink?: boolean
  }>()
</script>

<template>
  <div
    class="contentArea"
    v-bind="attrs"
    :class="{ expanded: !showingNavigation }"
  >
    <div class="contentContainer">
      <slot />

      <p class="light termsLink" v-if="!hideTermsLink">
        To use this platform, you agree to the
        <RouterLink to="/terms" class="prominentLink"
          >Terms of Service</RouterLink
        >.
      </p>
    </div>
  </div>
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    width: 100%
    padding: 0 var(--padding)

    &:not(.expanded)
      max-width: 65rem

    .contentContainer
      width: 100%
      height: 100%
      min-height: 100vh

      .termsLink
        text-align: center
        margin-top: 1rem
</style>
