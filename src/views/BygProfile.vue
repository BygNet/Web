<script setup lang="ts">
  import UnavailableState from '@/components/layout/UnavailableState.vue'
  import { title } from '@/data/title.ts'

  title.value = 'Profile'
</script>

<template>
  <UnavailableState title="Byg Profiles are coming soon." />
</template>

<style scoped lang="sass"></style>
