<script setup lang="ts">
  import HStack from '@/components/layout/HStack.vue'
  import { setFlag } from '@/utils/setUserFlag'
  import SafeLink from "~/components/base/SafeLink.vue";
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits([ 'close' ])
  const { t } = useI18n()

  function close() {
    setFlag('showCookieBanner', false)
    emit('close')
  }
</script>

<template>
  <div class="cookieBanner">
    <h2>{{ t('ui.cookie.title') }}</h2>

    <p>{{ t('ui.cookie.line1') }}</p>
    <p>{{ t('ui.cookie.line2') }}</p>
    <p>
      {{ t('ui.cookie.searchPrompt') }}
      <SafeLink to="/search" class="prominentLink">
        {{ t('ui.cookie.searchLink') }}
      </SafeLink>.
    </p>

    <HStack class="fullWidth autoSpace actions">
      <button class="transparent" @click="close()">
        {{ t('ui.cookie.dismissSecondary') }}
      </button>
      <button class="prominent" @click="close()">
        {{ t('ui.cookie.dismissPrimary') }}
      </button>
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .cookieBanner
    position: fixed
    left: 0
    right: 0
    z-index: 9999
    bottom: env(safe-area-inset-bottom, 0)
    background: themes.$foregroundOpaque
    border-radius: 0
    align-items: flex-start
    padding: 1.5rem
    animation: cookiesSlideIn 1s ease-in-out
    gap: 0.75rem

    .actions
      margin-top: 1rem

    @keyframes cookiesSlideIn
      from
        transform: translateY(100%)
      to
        transform: translateY(0)
</style>
