<script setup lang="ts">
  import ImageDetails from '@/views/ImageDetails.vue'

  definePageMeta({
    name: 'image',
    path: '/image/:slug',
  })
</script>

<template>
  <ImageDetails />
</template>
