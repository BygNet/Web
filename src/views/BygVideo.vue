<script setup lang="ts">
  import UnavailableState from '@/components/layout/UnavailableState.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Video'
</script>

<template>
  <UnavailableState title="Byg Video is coming soon." />
</template>

<style scoped lang="sass"></style>
