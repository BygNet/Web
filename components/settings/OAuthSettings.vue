<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import { api } from '@/api/client'
  import {
    loadOAuthProviders,
    type OAuthProvider,
    startOAuth,
  } from '@/auth/oauth'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import SettingsGroup from '@/components/settings/SettingsGroup.vue'

  interface OAuthAccount {
    provider: string
    username: string | null
    createdAt: string
  }

  const { t } = useI18n()
  const route = useRoute()
  const providers = ref<OAuthProvider[]>([])
  const accounts = ref<OAuthAccount[]>([])
  const loading = ref(true)
  const busy = ref<string | null>(null)
  const message = ref<string | null>(
    route.query.oauth === 'linked' ? t('ui.settings.oauth.connected') : null
  )
  const error = ref<string | null>(null)

  function accountFor(provider: OAuthProvider): OAuthAccount | null {
    return (
      accounts.value.find(account => account.provider === provider.id) ?? null
    )
  }

  async function refresh(): Promise<void> {
    loading.value = true
    try {
      providers.value = await loadOAuthProviders()
      const response = await api('/auth/oauth/accounts')
      accounts.value = response.ok ? await response.json() : []
    } catch {
      providers.value = []
      accounts.value = []
      error.value = t('ui.settings.oauth.errorLoad')
    } finally {
      loading.value = false
    }
  }

  async function connect(provider: OAuthProvider): Promise<void> {
    busy.value = provider.id
    error.value = null
    try {
      await startOAuth(provider, 'link')
    } catch {
      error.value = t('ui.settings.oauth.errorConnect')
      busy.value = null
    }
  }

  async function disconnect(provider: OAuthProvider): Promise<void> {
    if (
      !window.confirm(
        t('ui.settings.oauth.confirmDisconnect', { provider: provider.label })
      )
    )
      return

    busy.value = provider.id
    error.value = null
    message.value = null
    try {
      const response = await api(
        `/auth/oauth/${encodeURIComponent(provider.id)}`,
        {
          method: 'DELETE',
        }
      )
      if (response.status === 409) {
        error.value = t('ui.settings.oauth.errorLastAccount')
        return
      }
      if (!response.ok) {
        error.value = t('ui.settings.oauth.errorDisconnect')
        return
      }
      accounts.value = accounts.value.filter(
        account => account.provider !== provider.id
      )
      message.value = t('ui.settings.oauth.disconnected')
    } finally {
      busy.value = null
    }
  }

  onMounted(refresh)
</script>

<template>
  <SettingsGroup title="ui.settings.oauth.title">
    <details open class="oauthDetails">
      <summary>
        <HStack class="oauthSummary">
          <VStack class="summaryCopy">
            <strong>{{ t('ui.settings.oauth.heading') }}</strong>
            <span>{{ t('ui.settings.oauth.description') }}</span>
          </VStack>

          <Icon
            name="solar:alt-arrow-down-line-duotone"
            class="summaryChevron"
          />
        </HStack>
      </summary>

      <VStack v-if="loading" class="oauthLoading">
        <p>{{ t('ui.settings.oauth.loading') }}</p>
      </VStack>

      <VStack v-else-if="providers.length" class="oauthProviderList">
        <HStack
          v-for="provider in providers"
          :key="provider.id"
          class="oauthProviderCard"
        >
          <span class="providerIcon"><Icon :name="provider.icon" /></span>
          <VStack class="providerCopy">
            <strong>{{ provider.label }}</strong>
            <span v-if="accountFor(provider)?.username">
              {{
                t('ui.settings.oauth.connectedAs', {
                  username: accountFor(provider)?.username,
                })
              }}
            </span>
            <span v-else>{{ t('ui.settings.oauth.notConnected') }}</span>
          </VStack>
          <button
            v-if="accountFor(provider)"
            type="button"
            :disabled="busy === provider.id"
            @click="disconnect(provider)"
          >
            {{
              busy === provider.id
                ? t('ui.settings.oauth.working')
                : t('ui.settings.oauth.disconnect')
            }}
          </button>
          <button
            v-else
            type="button"
            class="prominent"
            :disabled="busy === provider.id"
            @click="connect(provider)"
          >
            {{
              busy === provider.id
                ? t('ui.settings.oauth.working')
                : t('ui.settings.oauth.connect')
            }}
          </button>
        </HStack>
      </VStack>

      <p v-else class="light">{{ t('ui.settings.oauth.notAvailable') }}</p>

      <p v-if="message" class="message success">{{ message }}</p>
      <p v-if="error" class="message">{{ error }}</p>
    </details>
  </SettingsGroup>
</template>

<style scoped lang="sass">
  @use '@/styles/utils'

  .oauthDetails
    width: 100%

    summary
      cursor: pointer
      list-style: none

      &::-webkit-details-marker
        display: none

  .oauthSummary
    width: 100%
    align-items: center
    gap: 0.75rem

  .providerIcon
    display: grid
    place-items: center
    width: 2.6rem
    height: 2.6rem
    flex: 0 0 2.6rem
    border-radius: 0.9rem
    background: var(--foregroundColor)
    font-size: 1.35rem

  .summaryCopy, .providerCopy
    min-width: 0
    flex: 1
    gap: 0.15rem

    span
      color: var(--textColorLight)
      font-size: 0.85rem

  .summaryChevron
    transition: transform 0.2s ease

  details:not([open]) .summaryChevron
    transform: rotate(-90deg)

  .oauthProviderList
    width: 100%
    gap: 0
    margin-top: 1rem

  .oauthProviderCard
    width: 100%
    gap: 0.75rem
    padding: 0.75rem 0

    &:not(:last-child)
      @include utils.listItemBorder

  .oauthLoading
    margin-top: 1rem

  .message
    margin: 0.75rem 0 0
    color: #c33

    &.success
      color: #3c3

  @media (max-width: 36rem)
    .oauthProviderCard
      flex-wrap: wrap

      button
        margin-left: 3.35rem
</style>
