<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import type { BygAsk } from '@/types/asks'
  import { shareAskAsImage } from '@/utils/askShareImage'

  const props = defineProps<{
    ask: BygAsk
    username: string
    asksUrl: string
  }>()

  const { t } = useI18n()
  const isSharing = ref(false)
  const shareMessage = ref<string | null>(null)
  const formattedDate = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(props.ask.createdDate))
  )

  async function share(): Promise<void> {
    if (isSharing.value) return

    isSharing.value = true
    shareMessage.value = null
    try {
      await shareAskAsImage({
        username: props.username,
        asksUrl: props.asksUrl,
        content: props.ask.content,
        createdDate: props.ask.createdDate,
      })
      shareMessage.value = t('ui.asks.shareReady')
    } catch {
      shareMessage.value = t('ui.asks.shareFailed')
    } finally {
      isSharing.value = false
      window.setTimeout(() => {
        shareMessage.value = null
      }, 2500)
    }
  }
</script>

<template>
  <VStack class="askCard">
    <HStack class="autoSpace askMeta">
      <p class="light">
        {{ formattedDate }}
      </p>

      <button @click="share" :disabled="isSharing">
        <Icon icon="solar:gallery-send-line-duotone" />
        {{ isSharing ? t('ui.asks.sharingImage') : t('ui.asks.shareImage') }}
      </button>
    </HStack>

    <p class="askContent">{{ ask.content }}</p>
    <p v-if="shareMessage" class="light shareMessage">{{ shareMessage }}</p>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .askCard
    @include utils.itemBackground
    @include utils.maxPostPaddedWidth

    width: 100%
    align-items: flex-start
    gap: 0.75rem

  .askMeta
    width: 100%
    align-items: center

  .askContent
    margin: 0
    white-space: pre-wrap
    word-break: break-word

  .shareMessage
    margin: 0
</style>
