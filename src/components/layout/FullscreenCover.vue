<script setup lang="ts"></script>
<template>
  <div class="fullScreenCover">
    <div class="fullScreenCoverContent">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="sass">
  @use "@/styles/themes"

  .fullScreenCover
    position: fixed
    display: flex
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    height: 100dvh
    align-items: center
    justify-content: center
    z-index: 5

    opacity: 0
    background: rgba(73, 73, 73, 0.15)
    backdrop-filter: blur(0.25rem)
    border-radius: 0
    animation: opacity 0.2s ease forwards

  .fullScreenCoverContent
    flex-direction: column
    width: calc(100% - 1rem)
    overflow: scroll

  @keyframes opacity
    0%
      opacity: 0

    100%
      opacity: 1
</style>
