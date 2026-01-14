<script setup lang="ts">
  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    title: string
  }>()
</script>

<template>
  <ContentArea class="unavailableState">
    <VStack class="noSpace">
      <h2>Early bird!</h2>
      <p>{{ title }}</p>
    </VStack>
  </ContentArea>
</template>
