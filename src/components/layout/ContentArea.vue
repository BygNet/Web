<script setup lang="ts"></script>

<template>
  <div class="contentArea">
    <slot />
  </div>
</template>

<style scoped lang="sass">
  .contentArea
    margin: var(--padding) 0
    min-height: 100vh
</style>
