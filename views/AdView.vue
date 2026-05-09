<script setup lang="ts">
  import type { BygAd } from '@bygnet/types'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import ReportButton from '@/components/posts/ReportButton.vue'

  defineProps<{
    ad: BygAd
  }>()
</script>

<template>
  <div class="bygAd">
    <img class="adImage" :src="ad.image" :alt="ad.name" />

    <HStack class="fullWidth autoSpace adMeta">
      <VStack class="noSpace">
        <h3>{{ ad.name }}</h3>
        <p class="light">Byg Ad</p>
      </VStack>

      <ReportButton />
    </HStack>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .bygAd
    @include utils.listItemBorder
    border-radius: 0
    padding-bottom: 0.5rem
    align-items: flex-start

    img
      width: 100%
      border-radius: 1rem

    .adMeta
      align-items: flex-end
</style>
