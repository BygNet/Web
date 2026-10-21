<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import {
    clearOAuthFlow,
    exchangeOAuthGrant,
    readOAuthFlow,
  } from '@/auth/oauth'
  import { completeServiceLogin } from '@/auth/serviceLogin'
  import { upsertAccount } from '@/auth/session'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { title } from '@/data/title'
  import { navigateTo } from '#app'

  definePageMeta({ showBackButton: false })

  const route = useRoute()
  const localePath = useLocalePath()
  const { t } = useI18n()
  const loading = ref(true)
  const requiresTwoFactor = ref(false)
  const twoFactorCode = ref('')
  const error = ref<string | null>(null)
  const flow = readOAuthFlow()

  title.value = t('auth.oauth.title')

  const provider = computed(() => String(route.query.provider ?? ''))
  const code = computed(() => String(route.query.code ?? ''))
  const state = computed(() => String(route.query.state ?? ''))
  const providerError = computed(() => String(route.query.oauth_error ?? ''))

  async function exchange(): Promise<void> {
    if (
      !flow ||
      flow.provider !== provider.value ||
      flow.nonce !== state.value
    ) {
      error.value = t('auth.oauth.invalidCallback')
      loading.value = false
      return
    }
    if (providerError.value) {
      error.value = t('auth.oauth.providerFailed')
      loading.value = false
      return
    }
    if (!code.value) {
      error.value = t('auth.oauth.missingCode')
      loading.value = false
      return
    }

    loading.value = true
    const response = await exchangeOAuthGrant({
      provider: provider.value,
      action: flow.action,
      code: code.value,
      ...(twoFactorCode.value ? { twoFactorCode: twoFactorCode.value } : {}),
    })

    if (response.status === 403) {
      const result = await response.json().catch(() => null)
      if (result?.requiresTwoFactor) {
        requiresTwoFactor.value = true
        loading.value = false
        return
      }
    }

    if (response.status === 409) {
      error.value = t('auth.oauth.accountExists')
      loading.value = false
      clearOAuthFlow()
      return
    }

    if (!response.ok) {
      error.value = t('auth.oauth.exchangeFailed')
      loading.value = false
      clearOAuthFlow()
      return
    }

    const result = await response.json().catch(() => null)
    clearOAuthFlow()

    if (flow.action === 'link') {
      await navigateTo(`${localePath('/settings')}?oauth=linked#security`)
      return
    }

    if (!result?.token || !result?.user) {
      error.value = t('auth.oauth.exchangeFailed')
      loading.value = false
      return
    }

    upsertAccount(result.token, result.user)
    const serviceRedirect = await completeServiceLogin(
      flow.serviceRedirectUri,
      flow.serviceState,
      result.token
    )
    if (serviceRedirect) {
      window.location.assign(serviceRedirect)
      return
    }
    await navigateTo(localePath('/'))
  }

  onMounted(() => {
    exchange().catch(() => {
      error.value = t('auth.oauth.exchangeFailed')
      loading.value = false
    })
  })
</script>

<template>
  <ContentArea class="oauthCallback">
    <VStack class="oauthCallbackCard">
      <Icon v-if="loading" name="svg-spinners:ring-resize" class="largeIcon" />
      <Icon
        v-else-if="!error"
        name="solar:check-circle-line-duotone"
        class="largeIcon"
      />
      <Icon v-else name="solar:danger-circle-line-duotone" class="largeIcon" />

      <h1>{{ t('auth.oauth.title') }}</h1>
      <p v-if="loading">{{ t('auth.oauth.finishing') }}</p>
      <p v-else-if="error">{{ error }}</p>

      <form
        v-if="requiresTwoFactor"
        @submit.prevent="exchange"
        class="twoFactorForm"
      >
        <label>
          {{ t('auth.loginPage.twoFactorCode') }}
          <input
            v-model="twoFactorCode"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            required
          />
        </label>
        <button type="submit" class="prominent" :disabled="loading">
          {{ t('auth.oauth.continue') }}
        </button>
      </form>

      <NuxtLink v-if="error" :to="localePath('/login')" class="prominentLink">
        {{ t('auth.oauth.returnToLogin') }}
      </NuxtLink>
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  .oauthCallback
    display: grid
    place-items: center

  .oauthCallbackCard
    max-width: 28rem
    width: 100%
    text-align: center

  .largeIcon
    font-size: 3rem
    color: var(--accentColor)

  .twoFactorForm
    width: 100%
    display: flex
    flex-direction: column
    gap: 0.75rem
    text-align: left
</style>
