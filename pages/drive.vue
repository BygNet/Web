<script setup lang="ts">
  import UnavailableState from '~/components/layout/UnavailableState.vue'
  import { title } from '~/data/title'

  definePageMeta({ showBackButton: true })

  title.value = 'Drive'
</script>

<template>
  <UnavailableState title="Byg Drive is coming soon." />
</template>

<style scoped lang="sass"></style>
