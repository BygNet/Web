<script setup lang="ts">
  import { watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

  import AppsGrid from '@/components/apps/AppsGrid.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { PageMetaByPath } from '@/data/pages'
  import { title } from '@/data/title'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'

  const { t } = useI18n()
  const pageMeta = PageMetaByPath['/explore']!

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })
  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })
</script>

<template>
  <ContentArea class="bygExplore">
    <section>
      <AppsGrid />
    </section>
  </ContentArea>
</template>

<style scoped lang="sass">
  section
    width: 100%
    margin-bottom: 1rem
    margin-top: 0.5rem

    h3
      margin-bottom: 0.75rem
</style>
