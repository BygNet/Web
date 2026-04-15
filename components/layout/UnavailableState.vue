<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    title: string
  }>()
</script>

<template>
  <ContentArea class="unavailableState">
    <VStack class="emptyState">
      <Icon class="alertIcon" icon="solar:danger-triangle-line-duotone" />
      <h2>Early bird!</h2>
      <p>{{ title }}</p>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .alertIcon
    width: 4rem
    height: 4rem
    margin: 1rem 0
</style>
