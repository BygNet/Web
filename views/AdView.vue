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
    <HStack class="fullWidth autoSpace adMeta">
      <VStack class="noSpace">
        <h3>{{ ad.name }}</h3>
        <p class="light">Byg Ad</p>
      </VStack>

      <ReportButton />
    </HStack>

    <img class="adImage" :src="ad.image" :alt="ad.name" />
  </div>
</template>

<style scoped lang="sass">
@use "@/styles/utils"
@use "@/styles/variables"

.bygAd
  @include utils.listItemBorder
  padding-bottom: 1rem
  align-items: flex-start
  flex-direction: row
  flex-wrap: nowrap
  width: 100%
  gap: 0.75rem

  img
    object-fit: cover
    min-height: 1rem
    max-height: 4rem
    border-radius: 1rem

  .adMeta
    align-items: flex-end


@media (max-width: variables.$mobileWidth)
  .bygAd
    flex-direction: column-reverse

    img
      width: 100%
</style>
