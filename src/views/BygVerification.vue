<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import ContentArea from '@/components/layout/ContentArea.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title.ts'
  import setHeadMeta from '@/utils/setHeadMeta.ts'
  import { getVerificationColor } from '@/utils/verificationData.ts'
  title.value = 'Verification'

  setHeadMeta({
    page: 'Verification',
    subtitle: 'Verify your identity with Byg.',
  })
</script>

<template>
  <ContentArea class="bygVerification">
    <h2>Types</h2>

    <HStack class="fullWidth autoSpace verificationTypes">
      <VStack>
        <Icon
          icon="solar:verified-check-bold"
          :style="{ color: getVerificationColor('notable') }"
        />
        Notable
      </VStack>

      <VStack>
        <Icon
          icon="solar:verified-check-bold"
          :style="{ color: getVerificationColor('organization') }"
        />
        Organization
      </VStack>

      <VStack>
        <Icon
          icon="solar:verified-check-bold"
          :style="{ color: getVerificationColor('government') }"
        />
        Government
      </VStack>

      <VStack>
        <Icon
          icon="solar:verified-check-bold"
          :style="{ color: getVerificationColor('identity') }"
        />
        Identity
      </VStack>
    </HStack>

    <h2>Get Verified</h2>
    <a href="https://tally.so/r/5BLyLN" target="_blank">
      <button class="large prominent">
        <Icon icon="solar:verified-check-line-duotone" />
        Get Started with Byg Verified
      </button>
    </a>

    <p>Fill out a form to start your verification process.</p>
  </ContentArea>
</template>

<style scoped lang="sass">
  .verificationTypes
    margin: 1rem 0
    max-width: 30rem

    .vStack
      align-items: center

      svg
        width: 4rem
        height: 4rem
</style>
