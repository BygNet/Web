<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import { auth, updateActiveUser } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'
  import { navigateTo } from '#app'

  const localePath = useLocalePath()
  const { t } = useI18n()

  definePageMeta({
    middleware: 'auth',
  })

  title.value = t('ui.emailVerificationPage.title')
  setHeadMeta({
    page: t('ui.emailVerificationPage.title'),
    subtitle: t('ui.emailVerificationPage.subtitle'),
  })

  const code = ref('')
  const isSubmitting = ref(false)
  const isResending = ref(false)
  const message = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function submit(): Promise<void> {
    error.value = null
    message.value = null
    isSubmitting.value = true

    try {
      const res = await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          code: code.value,
        }),
      })

      if (!res.ok) {
        error.value = t('ui.emailVerificationPage.invalidCode')
        return
      }

      if (auth.user) {
        updateActiveUser({
          ...auth.user,
          emailVerificationCode: null,
        })
      }

      message.value = t('ui.emailVerificationPage.verifiedSuccess')
      setTimeout(() => {
        navigateTo(localePath('settings'))
      }, 900)
    } finally {
      isSubmitting.value = false
    }
  }

  async function resend(): Promise<void> {
    error.value = null
    message.value = null
    isResending.value = true

    try {
      const res = await api('/auth/resend-email-verification', {
        method: 'POST',
      })

      message.value = res.ok
        ? t('ui.emailVerificationPage.resendSuccess')
        : t('ui.emailVerificationPage.resendFailure')
    } finally {
      isResending.value = false
    }
  }
</script>

<template>
  <ContentArea class="emailVerificationPage">
    <Icon name="solar:letter-line-duotone" class="emailIcon" />
    <h1>{{ t('ui.emailVerificationPage.heading') }}</h1>
    <p>
      {{
        t('ui.emailVerificationPage.instructions', {
          email:
            auth.user?.email ?? t('ui.emailVerificationPage.fallbackInbox'),
        })
      }}
    </p>

    <form @submit.prevent="submit" class="verifyForm">
      <label>
        {{ t('ui.emailVerificationPage.verificationCodeLabel') }}
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          required
        />
      </label>

      <button type="submit" class="prominent" :disabled="isSubmitting">
        <Icon name="solar:check-circle-line-duotone" />
        {{
          isSubmitting
            ? t('ui.emailVerificationPage.verifying')
            : t('ui.emailVerificationPage.verifyButton')
        }}
      </button>
    </form>

    <button @click="resend" class="transparent" :disabled="isResending">
      <Icon name="solar:letter-unread-line-duotone" />
      {{
        isResending
          ? t('ui.emailVerificationPage.sending')
          : t('ui.emailVerificationPage.resendButton')
      }}
    </button>

    <p v-if="message" class="success">
      {{ message }}
    </p>
    <p v-if="error" class="error">
      {{ error }}
    </p>
  </ContentArea>
</template>

<style scoped lang="sass">
  .emailIcon
    width: 3rem
    height: 3rem

  .verifyForm
    width: 100%
    max-width: 30rem
    margin: 2rem 0
    height: fit-content

    input
      font-size: 3rem
      text-align: center
</style>
