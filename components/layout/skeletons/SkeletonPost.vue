<script setup lang="ts">
  import SkeletonText from '@/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '@/components/layout/skeletons/SkeletonUser.vue'
  import VStack from '@/components/layout/VStack.vue'
  import HStack from '~/components/layout/HStack.vue'
</script>

<template>
  <div class="skeletonPost">
    <VStack class="fullWidth">
      <SkeletonText :lines="1" class="title" />
      <SkeletonUser />
      <SkeletonText :lines="Math.floor(Math.random() * 9) + 4" />

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
  </div>
</template>

<style scoped lang="sass">
  .skeletonPost
    border-bottom: var(--foregroundColor) solid 0.1rem
    border-radius: 0
    padding: 0.75rem 0
    margin-bottom: 0.5rem

    .title
      width: 40%

    .buttonContent
      width: 2rem
</style>
