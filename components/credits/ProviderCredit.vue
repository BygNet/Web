<script setup lang="ts">
  import HStack from '@/components/layout/HStack.vue'

  defineProps<{
    name: string
    icon: string
    link: string
  }>()
</script>

<template>
  <a :href="link" target="_blank">
    <HStack class="providerCredit">
      <Icon :name="icon" class="icon" />
      <p class="name">{{ name }}</p>
    </HStack>
  </a>
</template>

<style scoped lang="sass">
  .providerCredit
    margin: 0 1rem

    .icon
      width: 3rem
      height: 3rem
</style>
