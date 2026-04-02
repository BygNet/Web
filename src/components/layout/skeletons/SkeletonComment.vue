<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
</script>

<template>
  <div class="skeletonComment">
    <SkeletonUser />
    <SkeletonText :lines="Math.floor(Math.random() * 3) + 1" />
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .skeletonComment
    @include utils.itemBackground
</style>
