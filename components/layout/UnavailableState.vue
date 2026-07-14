<script setup lang="ts">
  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    title: string
  }>()
</script>

<template>
  <ContentArea class="unavailableState">
    <VStack class="emptyState">
      <Icon name="solar:danger-triangle-line-duotone" class="alertIcon" />
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
