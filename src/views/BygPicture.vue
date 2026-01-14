<script setup lang="ts">
  import UnavailableState from '@/components/layout/UnavailableState.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Picture'
</script>

<template>
  <UnavailableState title="Byg Picture is coming soon." />
</template>

<style scoped lang="sass"></style>
