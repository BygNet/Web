<script setup lang="ts">
import HStack from '@/components/layout/HStack.vue'
</script>

<template>
  <ClientOnly>
    <HStack class="skeletonUser">
      <div class="skeleton avatar" />
      <div class="skeleton username" />
    </HStack>
  </ClientOnly>
</template>

<style scoped lang="sass">
.skeletonUser
  .avatar
    width: 1rem
    height: 1rem
    border-radius: 50%

  .username
    width: 5rem
</style>
