<script setup lang="ts">
  import UnavailableState from '@/components/layout/UnavailableState.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  title.value = 'Search'
  setHeadMeta({
    page: 'Search',
    subtitle: 'Search the internet privately.',
  })
</script>

<template>
  <UnavailableState title="Byg Search is coming soon." />
</template>

<style scoped lang="sass"></style>
