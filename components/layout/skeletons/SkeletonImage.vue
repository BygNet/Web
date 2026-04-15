<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
</script>

<template>
  <VStack class="skeletonImage autoSpace">
    <div class="skeleton image" />
    <SkeletonUser />
    <SkeletonText :lines="2" />
  </VStack>
</template>

<style scoped lang="sass">
  @use '@/styles/utils'

  .skeletonImage
    @include utils.itemBackground
    overflow: hidden

    .image
      width: calc(100% + 0.75rem*2)
      height: 18rem
      margin: -0.75rem -0.75rem 0.5rem
</style>
