<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    name: string
    description: string
    icon: string
    link: string
  }>()
</script>

<template>
  <a :href="link" target="_blank" rel="noopener noreferrer" class="fullWidth">
    <HStack class="technologyCredit fullWidth autoSpace">
      <HStack class="technologyInfo">
        <Icon :icon="icon" />

        <VStack class="noSpace">
          <h5>{{ name }}</h5>
          <p class="light">{{ description }}</p>
        </VStack>
      </HStack>

      <Icon icon="solar:arrow-right-up-line-duotone" />
    </HStack>
  </a>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .technologyCredit
    @include utils.itemBackground

    .technologyInfo
      gap: 1rem

      svg
        width: 3rem
        height: 3rem
</style>
