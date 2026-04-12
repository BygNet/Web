<script setup lang="ts">
  import { computed, ref, useAttrs } from 'vue'
  import { useRoute } from 'vue-router'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { showingNavigation } from '@/data/visibility.ts'

  const attrs = useAttrs()
  const route = useRoute()
  const resendMessage = ref<string | null>(null)
  const isResending = ref(false)

  defineProps<{
    hideTermsLink?: boolean
    leftAlign?: boolean
  }>()

  defineOptions({
    inheritAttrs: false,
  })

  const showEmailVerificationBanner = computed(() => {
    return (
      !!auth.user?.emailVerificationCode && route.name !== 'email-verification'
    )
  })

  async function resendVerificationEmail(): Promise<void> {
    resendMessage.value = null
    isResending.value = true

    try {
      const res = await api('/auth/resend-email-verification', {
        method: 'POST',
      })

      resendMessage.value = res.ok
        ? 'Verification email sent.'
        : 'Could not resend verification email.'
    } finally {
      isResending.value = false
    }
  }
</script>

<template>
  <div class="contentArea" :class="{ expanded: !showingNavigation }">
    <div class="contentContainer" v-bind="attrs" :class="{ leftAlign }">
      <HStack
        v-if="showEmailVerificationBanner"
        class="emailVerificationBanner autoSpace"
      >
        <VStack class="bannerCopy">
          <strong>Email verification pending</strong>
          <!-- prettier-ignore -->
          <p>Verify <span>{{ auth.user?.email }}</span> to secure your account.</p>
          <!-- prettier-ignore -->
          <p v-if="resendMessage" class="light">{{ resendMessage }}</p>
          <!-- prettier-ignore -->
          <p class="light">Wrong email? Contact us at <a href="mailto:hi@byg.gg" class="prominentLink">hi@byg.gg</a>.</p>
        </VStack>

        <HStack class="bannerActions">
          <RouterLink to="/email-verification">
            <button class="prominent">Verify Email</button>
          </RouterLink>

          <button @click="resendVerificationEmail" :disabled="isResending">
            {{ isResending ? 'Sending...' : 'Resend Code' }}
          </button>
        </HStack>
      </HStack>

      <slot />

      <p class="light termsLink" v-if="!hideTermsLink">
        To use this platform, you agree to the
        <RouterLink to="/terms" class="prominentLink"
          >Terms of Service</RouterLink
        >.
      </p>
    </div>
  </div>
</template>

<style scoped lang="sass">
  .contentArea
    margin: 0 0 var(--padding)
    width: 100%
    padding: 0 var(--padding)

    &:not(.expanded)
      max-width: 65rem

    .contentContainer
      width: 100%
      height: 100%
      min-height: 100vh

      &.leftAlign
        align-items: flex-start

      .emailVerificationBanner
        gap: 1rem
        width: 100%
        padding: 1rem 0.5rem

        .bannerCopy
          gap: 0.2rem

          p
            margin: 0

      .termsLink
        text-align: center
        margin-top: 1rem
</style>
