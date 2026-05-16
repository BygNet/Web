<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import domtoimage from 'dom-to-image'
  import { computed, type Ref, ref, watch, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'

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
  import Modal from '~/components/layout/Modal.vue'
  import ModalActions from '~/components/layout/ModalActions.vue'

  const { t } = useI18n()
  const config = useEnv()
  const pageMeta = PageMetaByPath['/asks']!

  definePageMeta({
    middleware: 'auth',
    showBackButton: true,
  })

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
  const showingAsksShareModal: Ref<boolean> = ref(false)
  const currentSharingAsk: Ref<BygAsk | null> = ref(null)
  const shareCardRef: Ref<HTMLElement | null> = ref(null)

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

  function showShareModal(ask: BygAsk): void {
    currentSharingAsk.value = ask
    showingAsksShareModal.value = true
  }

  async function exportToImage(): Promise<void> {
    if (!shareCardRef.value || !currentSharingAsk.value) return
    await document.fonts.ready

    try {
      const blob = await domtoimage.toBlob(shareCardRef.value, {
        quality: 1,
        bgcolor: '#00000000',
        width: shareCardRef.value.offsetWidth * 4,
        height: shareCardRef.value.offsetHeight * 4,
        style: {
          transform: 'scale(4)',
          transformOrigin: 'top left',
          width: `${shareCardRef.value.offsetWidth}px`,
          height: `${shareCardRef.value.offsetHeight}px`,
        },
      })

      const file = new File([ blob ], `ask-${currentSharingAsk.value.id}.png`, {
        type: 'image/png',
      })

      if (navigator.share && navigator.canShare?.({ files: [ file ] })) {
        await navigator.share({
          files: [ file ],
        })
      } else {
        const downloadUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = file.name
        link.click()

        URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Failed to export ask card', error)
    }
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
    <Modal :visible="showingAsksShareModal && currentSharingAsk !== null">
      <VStack class="fullWidth asksShare" v-if="currentSharingAsk !== null">
        <div class="shareCardContainer" ref="shareCardRef">
          <div class="shareCard">
            <h2 class="titleBand">Ask @{{ username }} anything!</h2>
            <p>{{ currentSharingAsk.content }}</p>
            <p class="date">{{ formatDate(currentSharingAsk.createdDate) }}</p>
          </div>
        </div>

        <ModalActions>
          <template #cancellationAction>
            <button class="transparent" @click="showingAsksShareModal = false">
              {{ t('common.cancel') }}
            </button>
          </template>

          <template #confirmationAction>
            <button class="prominent" @click="exportToImage()">
              <Icon icon="solar:square-share-line-line-duotone" />
              {{ t('ui.asks.shareImage') }}
            </button>
          </template>
        </ModalActions>
      </VStack>
    </Modal>

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
        @share="showShareModal(ask)"
      />
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/fonts"

  .asksPage, .asksList
    width: 100%

  .asksShare
    @include utils.itemBackground

    .shareCardContainer
      &, *
        all: initial
        box-sizing: border-box
        font-family: fonts.$global
        color: #f3eaf4

      padding: 0
      max-width: 25rem

      .shareCard
        width: 100%
        padding: 0.75rem
        background: #2c0a40
        border-radius: 1.5rem
        overflow: hidden
        align-items: flex-start
        display: flex
        flex-direction: column
        gap: 0.5rem

        .titleBand
          margin: 0
          padding: 0.75rem
          background: linear-gradient(to left, #c52475, #5c2ec1)
          border-radius: 0.75rem
          font-size: larger
          font-weight: bold
          width: 100%

        p
          margin: 0
          width: 100%
          font-size: medium
          font-weight: 500

        .date
          opacity: 0.4
          font-size: small

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
