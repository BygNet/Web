<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { useRoute, useRouter } from 'vue-router'

  import VStack from '@/components/layout/VStack.vue'

  defineProps<{
    message: string
  }>()

  const router = useRouter()
  const route = useRoute()

  function reload(): void {
    router.replace({
      name: route.name!,
      params: route.params,
      query: { ...route.query, _r: Date.now() },
    })
  }
</script>

<template>
  <VStack class="emptyState">
    <Icon class="errorIcon" icon="solar:danger-triangle-line-duotone" />

    <h3>Something went wrong.</h3>
    <p>{{ message }}</p>

    <button @click="reload" class="reloadButton">
      <Icon icon="solar:refresh-line-duotone" />
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
