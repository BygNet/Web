<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'

  import HStack from '@/components/layout/HStack.vue'
  import { showingReportPopup } from '@/data/visibility'
  const { t } = useI18n()

  onMounted(() => {
    // @ts-ignore
    if (window.Tally) {
      // @ts-ignore
      Tally.loadEmbeds()
    }
  })
</script>

<template>
  <div class="reportView">
    <HStack class="fullWidth autoSpace">
      <h2>{{ t('ui.report.title') }}</h2>

      <button class="spinIcon" @click="showingReportPopup = false">
        <Icon icon="mingcute:close-fill" />
      </button>
    </HStack>

    <iframe
      data-tally-src="https://tally.so/embed/kdEQyo?alignLeft=1&hideTitle=1&transparentBackground=0&dynamicHeight=0"
      loading="lazy"
      width="100%"
      height="450"
      :title="t('ui.report.iframeTitle')"
    />
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .reportView
    @include utils.itemBackground

    position: fixed
    width: 50rem
    max-width: calc(100vw - 2rem - var(--padding)*2)
    z-index: 10000
    backdrop-filter: blur(0.5rem)
    bottom: 1rem
    right: 1rem
    align-items: flex-start
    gap: 0.75rem

    iframe
      border: none
      border-radius: 1rem
</style>
