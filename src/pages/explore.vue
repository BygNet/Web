<script setup lang="ts">
  import AppsGrid from '@/components/apps/AppsGrid.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Explore'
  setHeadMeta({
    page: 'Explore',
    subtitle: 'Browse apps and more by Byg.',
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
