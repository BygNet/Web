<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import {
    exchangeOAuthAccessToken,
    loadOAuthProviders,
    type OAuthProvider,
    startOAuth,
  } from '@/auth/oauth'
  import { auth, upsertAccount } from '@/auth/session'
  import VStack from '@/components/layout/VStack.vue'
  import { isThemeDark } from '@/data/themes'
  import { navigateTo } from '#app'

  const { t } = useI18n()
  const localePath = useLocalePath()
  const provider = ref<OAuthProvider | null>(null)
  const isLoading = ref(true)
  const isFallback = ref(false)
  const pendingToken = ref<string | null>(null)
  const twoFactorCode = ref('')
  const error = ref<string | null>(null)
  const containerId = `byg-yandex-button-${Math.random().toString(36).slice(2)}`

  let sdkPromise: Promise<void> | null = null

  function loadSdk(): Promise<void> {
    if (window.YaAuthSuggest) return Promise.resolve()
    if (sdkPromise) return sdkPromise

    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src =
        'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Yandex SDK failed to load'))
      document.head.appendChild(script)
    })

    return sdkPromise
  }

  async function finishSignIn(accessToken: string): Promise<void> {
    pendingToken.value = accessToken
    error.value = null
    const response = await exchangeOAuthAccessToken({
      provider: 'yandex',
      accessToken,
      ...(twoFactorCode.value ? { twoFactorCode: twoFactorCode.value } : {}),
    })

    if (response.status === 403) {
      const result = await response.json().catch(() => null)
      if (result?.requiresTwoFactor) {
        isLoading.value = false
        return
      }
    }

    if (response.status === 409) {
      error.value = t('auth.oauth.accountExists')
      isLoading.value = false
      return
    }

    if (!response.ok) {
      error.value = t('ui.yandexInstant.error')
      isLoading.value = false
      return
    }

    const result = await response.json()
    if (!result?.token || !result?.user) {
      error.value = t('ui.yandexInstant.error')
      isLoading.value = false
      return
    }

    pendingToken.value = null
    upsertAccount(result.token, result.user)
    await navigateTo(localePath('/'))
  }

  async function startInstantSignIn(): Promise<void> {
    if (!provider.value?.clientId || !window.YaAuthSuggest) return

    isLoading.value = true
    error.value = null
    try {
      const result = await window.YaAuthSuggest.init(
        {
          client_id: provider.value.clientId,
          response_type: 'token',
          redirect_uri: `${window.location.origin}/oauth/yandex-token`,
        },
        window.location.origin,
        {
          view: 'button',
          parentId: containerId,
          buttonView: 'main',
          buttonTheme: isThemeDark() ? 'dark' : 'light',
          buttonSize: 'm',
          buttonBorderRadius: 14,
          buttonIcon: 'yaEng',
        }
      )
      const data = await result.handler()
      const accessToken = data.access_token ?? data.token
      if (!accessToken) throw new Error('Yandex did not return a token')
      await finishSignIn(accessToken)
    } catch {
      isFallback.value = true
      isLoading.value = false
      error.value = t('ui.yandexInstant.error')
    }
  }

  async function startFallback(): Promise<void> {
    if (!provider.value) return
    isLoading.value = true
    error.value = null
    try {
      await startOAuth(provider.value, 'signin')
    } catch {
      isLoading.value = false
      error.value = t('ui.yandexInstant.error')
    }
  }

  async function submitTwoFactor(): Promise<void> {
    if (!pendingToken.value) return
    isLoading.value = true
    await finishSignIn(pendingToken.value)
  }

  onMounted(async () => {
    if (auth.user) {
      isLoading.value = false
      return
    }

    try {
      provider.value =
        (await loadOAuthProviders()).find(item => item.id === 'yandex') ?? null
      if (!provider.value?.clientId) return
      await loadSdk()
      await startInstantSignIn()
    } catch {
      isFallback.value = true
      isLoading.value = false
    }
  })
</script>

<template>
  <VStack v-if="provider" class="yandexInstant">
    <VStack class="noSpace copy">
      <h4>{{ t('ui.yandexInstant.title') }}</h4>
      <p>{{ t('ui.yandexInstant.description') }}</p>
    </VStack>

    <div v-if="!isFallback" :id="containerId" class="yandexButton" />
    <button
      v-else
      type="button"
      class="fallbackButton prominent"
      :disabled="isLoading"
      @click="startFallback"
    >
      <Icon name="solar:login-2-line-duotone" />
      {{ t('auth.oauth.continueWith', { provider: 'Yandex' }) }}
    </button>

    <form
      v-if="pendingToken"
      class="twoFactorForm"
      @submit.prevent="submitTwoFactor"
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
      <button type="submit" class="prominent" :disabled="isLoading">
        {{ t('ui.yandexInstant.continue') }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .yandexInstant
    @include utils.itemBackground
    width: 100%

    .copy
      *
        margin: 0

  .yandexButton
    min-height: 2.75rem
    display: flex
    justify-content: center

  .fallbackButton
    align-self: flex-start

  .twoFactorForm
    width: 100%
    display: flex
    flex-wrap: wrap
    align-items: end
    gap: 0.6rem

    label
      flex: 1 1 12rem

    button
      flex: 0 0 auto

  .error
    margin: 0
    color: var(--errorColor, #d45)
</style>
