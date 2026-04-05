<script setup lang="ts">
  import BygMessages from '@/views/BygMessages.vue'

  definePageMeta({
    name: 'messages',
    middleware: 'auth',
  })
</script>

<template>
  <BygMessages />
</template>
