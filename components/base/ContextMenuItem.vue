<script setup lang="ts">
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
    <Icon :name="props.icon" />
    {{ props.title }}
  </button>
</template>

<style scoped lang="sass">
  .contextMenuItem
    width: 100%
    justify-content: flex-start
    text-align: left
</style>
