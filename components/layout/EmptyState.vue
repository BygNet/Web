<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    message: string
  }>()
</script>

<template>
  <VStack class="emptyState">
    <Icon class="loader" icon="svg-spinners:90-ring-with-bg" />

    <h3>Please wait...</h3>
    <p>{{ message }}</p>
  </VStack>
</template>

<style scoped lang="sass">
  .loader
    width: 4rem
    height: 4rem
    margin: 1rem 0
</style>
