<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
  import HStack from '~/components/layout/HStack.vue'
</script>

<template>
  <VStack class="skeletonImage autoSpace">
    <div class="skeleton image" />
    <SkeletonUser />
    <SkeletonText :lines="2" />
    <HStack class="autoSpace fullWidth">
      <button disabled>
        <Icon name="solar:heart-outline" />
        <SkeletonText :lines="1" class="buttonContent" />
      </button>

      <HStack>
        <button disabled>
          <Icon name="solar:share-line-duotone" />
          <SkeletonText :lines="1" class="buttonContent" />
        </button>

        <button disabled>
          <Icon name="solar:flag-line-duotone" />
        </button>
      </HStack>
    </HStack>
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
      margin: -0.75rem -0.75rem -4rem
      mask-image: linear-gradient(to bottom, black 35%, transparent)

    .buttonContent
      width: 2rem
</style>
