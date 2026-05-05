<script setup lang="ts">
  import { computed, ref, useAttrs } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth } from '@/auth/session'
  import SafeLink from '@/components/base/SafeLink.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { useRoute } from '#app'

  const attrs = useAttrs()
  const route = useRoute()
  const { t } = useI18n()
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
        ? t('ui.emailVerificationBanner.resendSuccess')
        : t('ui.emailVerificationBanner.resendFailure')
    } finally {
      isResending.value = false
    }
  }
</script>

<template>
  <div class="contentArea">
    <div class="contentContainer" v-bind="attrs" :class="{ leftAlign }">
      <HStack
        v-if="showEmailVerificationBanner"
        class="emailVerificationBanner autoSpace"
      >
        <VStack class="bannerCopy">
          <strong>{{ t('ui.emailVerificationBanner.title') }}</strong>
          <!-- prettier-ignore -->
          <p>{{ t('ui.emailVerificationBanner.description', { email: auth.user?.email ?? '' }) }}</p>
          <!-- prettier-ignore -->
          <p v-if="resendMessage" class="light">{{ resendMessage }}</p>
          <!-- prettier-ignore -->
          <p class="light">
            {{ t('ui.emailVerificationBanner.wrongEmailPrefix') }}
            <a href="mailto:hi@byg.gg" class="prominentLink">hi@byg.gg</a>
            {{ t('ui.emailVerificationBanner.wrongEmailSuffix') }}
          </p>
        </VStack>

        <HStack class="bannerActions">
          <SafeLink to="/email-verification">
            <button class="prominent">
              {{ t('ui.emailVerificationBanner.verifyButton') }}
            </button>
          </SafeLink>

          <button @click="resendVerificationEmail" :disabled="isResending">
            {{
              isResending
                ? t('ui.emailVerificationBanner.sending')
                : t('ui.emailVerificationBanner.resendButton')
            }}
          </button>
        </HStack>
      </HStack>

      <slot />

      <p class="light termsLink" v-if="!hideTermsLink">
        {{ t('ui.terms.noticePrefix') }}
        <SafeLink to="/terms" class="prominentLink">
          {{ t('ui.terms.noticeLink') }}
        </SafeLink>
        {{ t('ui.terms.noticeSuffix') }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="sass">
  .contentArea
    width: 100%
    margin: var(--padding) 0
    padding: 0 var(--padding)
    position: relative

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
