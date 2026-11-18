<script setup lang="ts">
import { onMounted, ref } from 'vue'

import {
  exchangeOAuthAccessToken,
  loadOAuthProviders,
  type OAuthProvider,
  startOAuth,
} from '@/auth/oauth'
import { auth, upsertAccount } from '@/auth/session'
import VStack from '@/components/layout/VStack.vue'
import { navigateTo } from '#app'
import SafeLink from '~/components/base/SafeLink.vue'
import HStack from '~/components/layout/HStack.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const provider = ref<OAuthProvider | null>(null)
const isLoading = ref(true)
const pendingToken = ref<string | null>(null)
const twoFactorCode = ref('')
const error = ref<string | null>(null)

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
    error.value = t('ui.instantLogin.error')
    isLoading.value = false
    return
  }

  const result = await response.json()
  if (!result?.token || !result?.user) {
    error.value = t('ui.instantLogin.error')
    isLoading.value = false
    return
  }

  pendingToken.value = null
  upsertAccount(result.token, result.user)
  await navigateTo(localePath('/'))
}

async function startInstantSignIn() {
  if (!provider.value?.clientId || !window.YaAuthSuggest) return

  const result = await window.YaAuthSuggest.init(
    {
      client_id: provider.value.clientId,
      response_type: 'token',
      redirect_uri: `${window.location.origin}/oauth/yandex-token`,
    },
    window.location.origin
  )

  if (result.status !== 'ok') return

  const data = await result.handler()
  const accessToken = data.access_token ?? data.token

  if (accessToken) {
    await finishSignIn(accessToken)
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
    error.value = t('ui.instantLogin.error')
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
    await startInstantSignIn()
  } catch {
    isLoading.value = false
  }
})
</script>

<template>
  <VStack v-if="provider" class="instantLogin autoSpace">
    <HStack class="fullWidth autoSpace">
      <h4>{{ t('ui.instantLogin.title') }}</h4>

      <HStack>
        <SafeLink to="/login">
          <button>
            <Icon name="solar:login-2-line-duotone" />
            {{ t('pages.login.title') }}
          </button>
        </SafeLink>

        <button
          class="yandexButton"
          :disabled="isLoading"
          @click="startFallback"
        >
          <Icon name="thesvg-color:yandex" />
          {{ t('auth.oauth.continueWith', { provider: 'Yandex' }) }}
        </button>
      </HStack>
    </HStack>

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
        {{ t('ui.instantLogin.continue') }}
      </button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </VStack>
</template>

<style scoped lang="sass">
.instantLogin
  width: 100%

  h4
    margin: 0

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
