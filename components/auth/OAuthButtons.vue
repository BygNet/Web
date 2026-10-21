<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import {
    loadOAuthProviders,
    type OAuthAction,
    type OAuthProvider,
    startOAuth,
  } from '@/auth/oauth'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'

  const props = withDefaults(
    defineProps<{
      action?: OAuthAction
      serviceRedirectUri?: string
      serviceState?: string
    }>(),
    { action: 'signin' }
  )

  const { t } = useI18n()
  const providers = ref<OAuthProvider[]>([])
  const loading = ref<string | null>(null)
  const error = ref(false)

  async function begin(provider: OAuthProvider): Promise<void> {
    loading.value = provider.id
    error.value = false
    try {
      await startOAuth(provider, props.action, {
        serviceRedirectUri: props.serviceRedirectUri,
        serviceState: props.serviceState,
      })
    } catch {
      error.value = true
      loading.value = null
    }
  }

  onMounted(async () => {
    providers.value = await loadOAuthProviders()
  })
</script>

<template>
  <VStack v-if="providers.length" class="oauthButtons">
    <HStack class="oauthProviderList">
      <button
        v-for="provider in providers"
        :key="provider.id"
        class="oauthButton"
        :disabled="loading !== null"
        @click="begin(provider)"
      >
        <Icon
          :name="
            loading === provider.id ? 'svg-spinners:ring-resize' : provider.icon
          "
        />

        {{ t('auth.oauth.continueWith', { provider: provider.label }) }}
      </button>
    </HStack>

    <p v-if="error" class="oauthError">{{ t('auth.oauth.startFailed') }}</p>
  </VStack>
</template>

<style scoped lang="sass">
  @use '@/styles/utils'

  .oauthButtons
    width: 100%
    gap: 0.75rem
    margin-bottom: 2rem

  .oauthProviderList
    width: 100%
    flex-wrap: wrap

  .oauthButton
    width: 100%

  .oauthError
    color: var(--errorColor, #d45)
    margin: 0
</style>
