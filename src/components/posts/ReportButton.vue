<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import { showingReportPopup } from '@/data/visibility.ts'

  function showReportPopup(): void {
    showingReportPopup.value = true
  }
</script>

<template>
  <button class="reportButton" @click="showReportPopup()">
    <Icon icon="solar:flag-line-duotone" />
    Report
  </button>
</template>

<style scoped lang="sass"></style>
