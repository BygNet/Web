<script setup lang="ts">
  import EmptyView from '@/components/layout/EmptyView.vue'
  import HStack from '@/components/layout/HStack.vue'
</script>

<template>
  <HStack class="modalActions fullWidth autoSpace">
    <HStack>
      <slot name="cancellationAction" />
      <EmptyView />
    </HStack>

    <HStack>
      <slot name="deletionAction" />
      <slot name="confirmationAction" />
    </HStack>
  </HStack>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .modalActions
    border-top: 0.1rem solid themes.$foregroundColor
    padding-top: 0.5rem
    border-radius: 0
    margin-top: 1rem
</style>
