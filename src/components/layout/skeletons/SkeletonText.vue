<script setup lang="ts">
  import VStack from '@/components/layout/VStack.vue'
  import { generateLines } from '@/utils/skeletons.ts'

  const props = defineProps<{
    lines: number
  }>()
</script>

<template>
  <VStack class="skeletonText fullWidth">
    <div
      v-for="(line, i) in generateLines(props.lines)"
      :key="i"
      class="skeleton text"
      :style="{ width: line + '%' }"
    />
  </VStack>
</template>

<style scoped lang="sass">
  .skeletonText
    gap: 0.25rem

    .text
      height: 1.25rem
</style>
