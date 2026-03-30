<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  title.value = 'Verification'

  setHeadMeta({
    page: 'Verification',
    subtitle: 'Verify your identity with Byg.',
  })
</script>

<template>
  <ContentArea class="bygVerification">
    <a href="https://tally.so/r/5BLyLN" target="_blank">
      <button class="large prominent">
        <Icon icon="solar:verified-check-line-duotone" />
        Get Started with Byg Verified
      </button>
    </a>

    <p>Fill out a form to start your verification process.</p>
  </ContentArea>
</template>
