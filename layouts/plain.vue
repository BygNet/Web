<script setup lang="ts">
  import { blurContent } from '~/data/visibility'
</script>

<template>
  <main class="blurrable plainLayout" :class="{ blurred: blurContent }">
    <slot />
  </main>
</template>
