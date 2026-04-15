<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { ref } from 'vue'

  import { api } from '@/api/client'
  import { auth, updateActiveUser } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import { title } from '@/data/title'
  import setHeadMeta from '@/utils/setHeadMeta'
  import { navigateTo } from '#app'

  title.value = 'Verify Email'
  setHeadMeta({
    page: 'Verify Email',
    subtitle: 'Confirm your account email with the code we sent you.',
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
        error.value = 'That verification code was not accepted'
        return
      }

      if (auth.user) {
        updateActiveUser({
          ...auth.user,
          emailVerificationCode: null,
        })
      }

      message.value = 'Your email is verified now.'
      setTimeout(() => {
        navigateTo({ name: 'settings' })
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
        ? 'A fresh verification email is on the way.'
        : 'Could not resend the verification email.'
    } finally {
      isResending.value = false
    }
  }
</script>

<template>
  <ContentArea class="emailVerificationPage">
    <Icon class="emailIcon" icon="solar:letter-line-duotone" />
    <h1>Verify Your Email</h1>
    <p>
      Enter the 6-digit code sent to
      <strong>{{ auth.user?.email ?? 'your inbox' }}</strong
      >.
    </p>

    <form @submit.prevent="submit" class="verifyForm">
      <label>
        Verification Code
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
        <Icon icon="solar:check-circle-line-duotone" />
        {{ isSubmitting ? 'Verifying...' : 'Verify Email' }}
      </button>
    </form>

    <button @click="resend" class="transparent" :disabled="isResending">
      <Icon icon="solar:letter-unread-line-duotone" />
      {{ isResending ? 'Sending...' : 'Resend Code' }}
    </button>

    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
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
