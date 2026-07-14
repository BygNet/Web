<script setup lang="ts">
  import { showingReportPopup } from '@/data/visibility'

  function showReportPopup(): void {
    showingReportPopup.value = true
  }
</script>

<template>
  <button class="reportButton" @click="showReportPopup()">
    <Icon name="solar:flag-line-duotone" />
  </button>
</template>

<style scoped lang="sass"></style>
