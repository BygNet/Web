<script setup lang="ts">
  import BygSettings from '@/views/BygSettings.vue'

  definePageMeta({
    name: 'settings',
    middleware: 'auth',
  })
</script>

<template>
  <BygSettings />
</template>
