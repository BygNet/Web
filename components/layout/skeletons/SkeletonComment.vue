<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
</script>

<template>
  <VStack class="skeletonComment">
    <SkeletonUser />
    <SkeletonText :lines="Math.floor(Math.random() * 3) + 1" />
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .skeletonComment
    @include utils.itemBackground
    width: 100%
</style>
