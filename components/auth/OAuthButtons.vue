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
    <div class="oauthDivider">
      <span>{{ t('auth.oauth.orContinueWith') }}</span>
    </div>

    <HStack class="oauthProviderList">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        class="oauthButton"
        :disabled="loading !== null"
        @click="begin(provider)"
      >
        <Icon :name="provider.icon" />
        <span>{{
          t('auth.oauth.continueWith', { provider: provider.label })
        }}</span>
        <Icon
          v-if="loading === provider.id"
          name="svg-spinners:ring-resize"
          class="loadingIcon"
        />
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

  .oauthDivider
    width: 100%
    display: flex
    align-items: center
    gap: 0.75rem
    color: var(--textColorLight)
    font-size: 0.85rem

    &::before, &::after
      content: ''
      flex: 1
      height: 1px
      background: var(--borderColor)

  .oauthProviderList
    width: 100%
    flex-wrap: wrap

  .oauthButton
    flex: 1 1 14rem
    justify-content: center
    min-height: 2.75rem
    gap: 0.5rem

    .loadingIcon
      margin-left: auto

  .oauthError
    color: var(--errorColor, #d45)
    margin: 0
</style>
