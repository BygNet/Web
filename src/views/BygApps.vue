<script setup lang="ts">
  import AppsGrid from '@/components/apps/AppsGrid.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Apps'
  setHeadMeta({
    page: 'Apps',
    subtitle: 'Browse apps by Byg.',
  })
</script>

<template>
  <ContentArea class="bygApps">
    <section>
      <h3>From Byg</h3>
      <AppsGrid />
    </section>
  </ContentArea>
</template>

<style scoped lang="sass">
  section
    width: 100%
    margin-bottom: 1rem

    h3
      margin-bottom: 0.75rem
</style>
