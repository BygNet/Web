<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
</script>

<template>
  <ContentArea class="afterLogin">
    <h1>Welcome to Byg!</h1>
    <p>Browse posts, send messages, and search the web freely with Byg.</p>

    <h2>Don't forget to enable notifications!</h2>
    <p>Stay up to date with messages, comments, and more.</p>

    <RouterLink to="/notifications">
      <button class="prominent">
        <Icon icon="solar:bell-bing-line-duotone" />
        Notifications
      </button>
    </RouterLink>
  </ContentArea>
</template>

<style scoped lang="sass"></style>
