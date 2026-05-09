<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  const props = defineProps<{
    title: string
    icon: string
  }>()

  defineEmits<{
    click: []
  }>()
</script>

<template>
  <button class="contextMenuItem" type="button" @click="$emit('click')">
    <Icon :icon="props.icon" />
    {{ props.title }}
  </button>
</template>

<style scoped lang="sass">
  .contextMenuItem
    width: 100%
    justify-content: flex-start
    text-align: left
</style>
