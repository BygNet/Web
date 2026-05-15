<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, type Ref, ref, watch, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

  definePageMeta({
    middleware: 'auth',
    showBackButton: true,
  })

  import { auth } from '@/auth/session'
  import AskCard from '@/components/asks/AskCard.vue'
  import ContentArea from '@/components/layout/ContentArea.vue'
  import EmptyState from '@/components/layout/EmptyState.vue'
  import ErrorState from '@/components/layout/ErrorState.vue'
  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { fetchCurrentUserAsks } from '@/data/asks'
  import { PageMetaByPath } from '@/data/pages'
  import { title } from '@/data/title'
  import type { BygAsk } from '@/types/asks'
  import { useEnv } from '@/utils/env'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'

  const { t } = useI18n()
  const config = useEnv()
  const pageMeta = PageMetaByPath['/asks']!

  watchEffect(() => {
    title.value = t(pageMeta.titleKey)
  })

  setHeadMetaKeys({
    pageKey: pageMeta.titleKey,
    subtitleKey: pageMeta.descriptionKey,
  })

  const asks: Ref<BygAsk[]> = ref<BygAsk[]>([])
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const copyMessage: Ref<string | null> = ref(null)
  const username = computed(() => auth.user?.username ?? '')
  const asksUrl = computed(() => {
    if (!username.value) return ''
    const base = String(config.asksBase).replace(/\/+$/, '')
    return `${base}/${encodeURIComponent(username.value)}`
  })

  async function loadAsks(options: { force?: boolean } = {}): Promise<void> {
    loading.value = true
    error.value = null
    try {
      asks.value = await fetchCurrentUserAsks(options)
    } catch {
      error.value = t('ui.asks.errorLoadAsks')
    } finally {
      loading.value = false
    }
  }

  async function copyUrl(): Promise<void> {
    if (!asksUrl.value) return

    try {
      await navigator.clipboard.writeText(asksUrl.value)
      copyMessage.value = t('ui.asks.copySuccess')
    } catch {
      copyMessage.value = t('ui.asks.copyFailed')
    }

    window.setTimeout(() => {
      copyMessage.value = null
    }, 2500)
  }

  async function openPublicUrl(): Promise<void> {
    if (!asksUrl.value) return
    window.open(asksUrl.value, '_blank', 'noopener,noreferrer')
  }

  watch(
    () => auth.user?.id,
    async (nextId, previousId) => {
      if (!nextId) {
        asks.value = []
        loading.value = false
        return
      }

      if (nextId === previousId) return
      await loadAsks({ force: true })
    },
    { immediate: true }
  )
</script>

<template>
  <ContentArea class="asksPage">
    <VStack class="asksHeader fullWidth">
      <HStack class="fullWidth autoSpace headerRow">
        <VStack class="headerCopy noSpace">
          <h2>{{ t('ui.asks.title') }}</h2>
          <p class="light">{{ t('ui.asks.subtitle') }}</p>
        </VStack>

        <HStack class="headerActions">
          <button @click="copyUrl" :disabled="!asksUrl">
            <Icon icon="solar:copy-line-duotone" />
            {{ copyMessage ? copyMessage : t('ui.asks.copyUrl') }}
          </button>

          <button class="prominent" @click="openPublicUrl" :disabled="!asksUrl">
            <Icon icon="solar:link-line-duotone" />
            {{ t('ui.asks.openPublicUrl') }}
          </button>
        </HStack>
      </HStack>

      <p class="light asksUrl" v-if="asksUrl">
        {{ asksUrl }}
      </p>

      <p v-if="copyMessage" class="light copyMessage">
        {{ copyMessage }}
      </p>
    </VStack>

    <EmptyState v-if="loading" :message="t('ui.asks.loading')" />
    <ErrorState v-else-if="error" :message="error" />

    <EmptyState
      v-else-if="asks.length < 1"
      :message="t('ui.asks.emptyState')"
    />

    <VStack v-else class="asksList fullWidth">
      <AskCard
        v-for="ask in asks"
        :key="ask.id"
        :ask="ask"
        :username="username"
        :asks-url="asksUrl"
      />
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .asksPage, .asksList
    width: 100%

  .asksHeader
    @include utils.itemBackground
    @include utils.maxPostPaddedWidth

    margin-bottom: 0.75rem
    align-items: flex-start
    gap: 0.5rem

  .headerRow
    align-items: flex-start
    gap: 0.75rem

  .headerCopy
    gap: 0.2rem

  .headerActions
    gap: 0.5rem
    flex-wrap: wrap
    justify-content: flex-end

  .asksUrl
    margin: 0
    word-break: break-all

  .copyMessage
    margin: 0
</style>
