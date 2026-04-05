<script setup lang="ts">
  import BygProfile from '@/views/BygProfile.vue'

  definePageMeta({
    name: 'userProfile',
    path: '/u/:username',
  })
</script>

<template>
  <BygProfile />
</template>
