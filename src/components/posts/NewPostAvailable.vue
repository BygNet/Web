<script setup lang="ts">
  defineEmits<{
    (e: 'click'): void
  }>()
</script>

<template>
  <div class="newPosts" @click="$emit('click')">
    <h2>New Posts!</h2>
    <p class="light">Click to refresh.</p>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/colors"

  .newPosts
    position: fixed
    align-items: flex-start
    min-width: 16rem
    padding: 1rem
    margin-left: 1rem

    border-radius: 1.5rem
    background: colors.$foregroundColor
    border: 0.2rem solid colors.$foregroundColor
    backdrop-filter: blur(2rem)
    transition: 0.2s ease
    z-index: 100
    cursor: pointer
    animation: slideTop 0.3s forwards ease

    &:hover
      scale: 1.1
      transform: translateY(0.5rem)

    &:active
      transform: translateY(0)

  @keyframes slideTop
    0%
      top: calc(-100% - 2rem)

    100%
      top: 1rem
</style>
