<script setup lang="ts">
  import { onMounted, ref, type Ref } from 'vue'
  import { Icon } from '@iconify/vue'
  import type { BygShop } from '@/types/contentTypes.ts'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import VStack from '@/components/layout/VStack.vue'
  import HStack from '@/components/layout/HStack.vue'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import ContentArea from '@/components/layout/ContentArea.vue'

  const shops: Ref<BygShop[]> = ref([])
  const isLoaded: Ref<boolean> = ref(false)

  setHeadMeta({ page: 'Shop', subtitle: 'Byg shopping hub.' })

  onMounted(async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/shops`)
    shops.value = (await res.json()) as BygShop[]
    isLoaded.value = true
  })
</script>

<template>
  <ContentArea class="bygShop">
    <EmptyState v-if="!isLoaded" message="Loading shops." />

    <VStack v-else class="shopList">
      <a v-for="shop in shops" :href="shop.openUrl" class="shopLink">
        <div class="shopItem">
          <HStack class="shopDetails">
            <img
              class="shopImage"
              :src="`/shops/${shop.imageName}.svg`"
              :alt="`${shop.title} Icon`"
            />
            <VStack class="noSpace">
              <h3>{{ shop.title }}</h3>
              <p>{{ shop.subtitle }}</p>
            </VStack>

            <Icon class="externIcon" icon="solar:arrow-right-up-line-duotone" />
          </HStack>
        </div>
      </a>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .shopList
    width: 100%

  .shopLink
    width: 100%

  .shopItem
    width: 100%
    @include utils.itemBackground

    .shopDetails
      width: 100%
      justify-content: space-between

      .externIcon
        margin-left: auto
        width: 1rem
        height: 1rem

      .shopImage
        width: 4rem
        height: 2rem
</style>
