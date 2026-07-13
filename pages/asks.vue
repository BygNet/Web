<script setup lang="ts">
  import { type BygAsk, getAskGradient, getAskVariantById } from '@bygnet/types'
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
  import { useEnv } from '@/utils/env'
  import { setHeadMetaKeys } from '@/utils/setHeadMeta'
  import Modal from '~/components/layout/Modal.vue'
  import ModalActions from '~/components/layout/ModalActions.vue'
  import SkeletonText from '~/components/layout/skeletons/SkeletonText.vue'
  import SkeletonUser from '~/components/layout/skeletons/SkeletonUser.vue'
  import { shortenUrl } from '~/utils/shortenUrl'

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
  const copyIcon: Ref<string> = ref('solar:copy-line-duotone')
  const username = computed(() => auth.user?.username ?? '')
  const asksUrl = computed(() => {
    if (!username.value) return ''
    const base = String(config.asksBase).replace(/\/+$/, '')
    return `${base}/${encodeURIComponent(username.value)}`
  })
  const showingAsksShareModal: Ref<boolean> = ref(false)
  const currentSharingAsk: Ref<BygAsk | null> = ref(null)
  const shareCardRef: Ref<HTMLElement | null> = ref(null)

  const askVariant = computed(() => {
    return getAskVariantById(currentSharingAsk.value?.variantId!)
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
      copyIcon.value = 'solar:check-circle-line-duotone'
    } catch {
      copyIcon.value = 'solar:danger-triangle-line-duotone'
    }

    window.setTimeout(() => {
      copyIcon.value = 'solar:copy-line-duotone'
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
          <div
            class="shareCard"
            :style="{
              background: askVariant.colors.background,
              color: askVariant.colors.text,
            }"
          >
            <h2
              class="titleBand"
              :style="{ '--tint': getAskGradient(askVariant) }"
            >
              {{
                t(`ask-variants.${currentSharingAsk.variantId}.header`, {
                  username: '@' + username,
                })
              }}
            </h2>

            <div class="askContent">
              <p>{{ currentSharingAsk.content }}</p>

              <HStack class="infoBar">
                <p class="url" v-if="asksUrl">
                  {{ shortenUrl(asksUrl) }}
                </p>
                <p class="date">
                  {{ formatDate(currentSharingAsk.createdDate) }}
                </p>
              </HStack>
            </div>
          </div>
        </div>

        <ModalActions>
          <template #cancellationAction>
            <button class="transparent" @click="showingAsksShareModal = false">
              {{ t('common.cancel') }}
            </button>
          </template>

          <template #confirmationAction>
            <button class="prominent bounceRightIcon" @click="exportToImage()">
              <Icon icon="solar:square-share-line-line-duotone" />
              {{ t('ui.asks.shareImage') }}
            </button>
          </template>
        </ModalActions>
      </VStack>
    </Modal>

    <VStack class="asksHeader fullWidth">
      <VStack class="fullWidth autoSpace header">
        <p>{{ t('ui.asks.subtitle') }}</p>

        <h3>{{ t('ui.asks.page.title') }}</h3>
        <HStack class="headerActions">
          <button @click="copyUrl" :disabled="!asksUrl">
            <Icon :icon="copyIcon" />
            {{ t('common.copy') }}
          </button>

          <button class="prominent" @click="openPublicUrl" :disabled="!asksUrl">
            <Icon icon="solar:link-line-duotone" />
            {{ t('common.open') }}
          </button>
        </HStack>
      </VStack>

      <p class="light asksUrl" v-if="asksUrl">
        {{ asksUrl }}
      </p>
    </VStack>

    <VStack v-if="loading" class="asksList placeholder">
      <VStack class="askCard placeholder fullWidth" v-for="() in 50">
        <SkeletonUser />
        <SkeletonText :lines="2" />
        <SkeletonText :lines="1" style="width: 30%" />
      </VStack>
    </VStack>

    <ErrorState v-if="error" :message="error" />

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
        @click="showShareModal(ask)"
      />
    </VStack>
  </ContentArea>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"
  @use "@/styles/fonts"

  .asksPage, .asksList
    width: 100%

    .askCard.placeholder
      @include utils.listItemBorder

      padding-bottom: 1rem
      border-radius: 0

  .asksShare
    @include utils.itemBackground

    .shareCardContainer
      &, *
        all: initial
        box-sizing: border-box
        font-family: fonts.$global
        color: #f3eaf4
        white-space: pre-wrap
        word-break: break-word
        overflow-wrap: anywhere

      padding: 0
      max-width: 25rem

      .shareCard
        width: 100%
        padding: 0.35rem
        background: #2c0a40
        border-radius: 1.25rem
        overflow: hidden
        align-items: flex-start
        display: flex
        flex-direction: column

        .titleBand
          margin: 0
          padding: 0.35rem 0.40rem // reduce inline padding due to font spacing
          background: linear-gradient(to left, var(--tint))
          border-radius: 0.9rem
          font-size: larger
          font-weight: bold
          width: 100%

        .askContent
          padding: 0.5rem

          p
            margin: 0
            width: 100%
            font-size: medium
            font-weight: 500

          .infoBar
            display: flex
            justify-content: space-between
            width: 100%
            margin-top: 0.5rem
            gap: 0.5rem

          .date, .url
            opacity: 0.4
            font-size: small
            width: fit-content

  .asksHeader
    @include utils.listItemBorder

    border-radius: 0
    padding-bottom: 0.5rem
    margin-bottom: 1.5rem
    align-items: flex-start
    gap: 0.5rem

  .headerActions
    gap: 0.5rem
    flex-wrap: wrap
    justify-content: flex-end

  .asksUrl
    margin: 0
    word-break: break-all
</style>
