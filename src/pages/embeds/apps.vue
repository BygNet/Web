<script setup lang="ts">
  import AppsGrid from '@/components/apps/AppsGrid.vue'
  import EmbedShell from '@/components/embeds/EmbedShell.vue'
  import setHeadMeta from '@/utils/setHeadMeta.ts'

  setHeadMeta({
    page: 'Apps Embed',
    subtitle: 'Embeddable app launcher for Byg.',
  })
</script>

<template>
  <EmbedShell title="Byg Apps" class="bygAppsEmbed">
    <AppsGrid embed />
  </EmbedShell>
</template>
