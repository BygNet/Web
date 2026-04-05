<script setup lang="ts">
  import BygNotifications from '@/views/BygNotifications.vue'

  definePageMeta({
    name: 'notifications',
    middleware: 'auth',
  })
</script>

<template>
  <BygNotifications />
</template>
