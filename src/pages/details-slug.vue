<script setup lang="ts">
  import PostDetails from '@/views/PostDetails.vue'

  definePageMeta({
    name: 'details',
    path: '/details/:slug',
  })
</script>

<template>
  <PostDetails />
</template>
