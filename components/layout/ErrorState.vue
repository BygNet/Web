<script setup lang="ts">
  import VStack from '@/components/layout/VStack.vue'
  import { navigateTo, useRoute } from '#app'

  defineProps<{
    message: string
  }>()

  const route = useRoute()

  function reload(): void {
    navigateTo({
      name: route.name!,
      params: route.params,
      query: { ...route.query, _r: Date.now() },
      replace: true,
    })
  }
</script>

<template>
  <VStack class="emptyState">
    <Icon name="solar:danger-triangle-line-duotone" class="errorIcon" />

    <h3>Something went wrong.</h3>
    <p>{{ message }}</p>

    <button @click="reload" class="reloadButton">
      <Icon name="solar:refresh-line-duotone" />
      Reload
    </button>
  </VStack>
</template>

<style scoped lang="sass">
  .errorIcon
    width: 4rem
    height: 4rem
    margin: 1rem 0

  .reloadButton
    margin-top: 1rem
</style>
