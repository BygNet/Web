<script setup lang="ts">
  import { navigateTo } from 'nuxt/app'

  await navigateTo('/', {
    redirectCode: 302,
    replace: true,
  })
</script>

<template />
