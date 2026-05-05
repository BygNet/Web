<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
</script>

<template>
  <div class="skeletonPost">
    <VStack class="fullWidth">
      <SkeletonText :lines="1" class="title" />
      <SkeletonUser />
      <SkeletonText :lines="Math.floor(Math.random() * 9) + 4" />
    </VStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/themes"

  .skeletonPost
    border-bottom: themes.$foregroundColor solid 0.1rem
    border-radius: 0
    padding: 0.75rem 0
    margin-bottom: 0.5rem

    .title
      width: 40%
</style>
