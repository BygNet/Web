<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'
  import type { BygAsk } from '@/types/asks'

  const props = defineProps<{
    ask: BygAsk
    username: string
    asksUrl: string
  }>()

  defineEmits([ 'share' ])

  const { t } = useI18n()
  const shareMessage = ref<string | null>(null)
  const formattedDate = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(props.ask.createdDate))
  )
</script>

<template>
  <VStack class="askCard">
    <HStack class="autoSpace askMeta">
      <p class="light">
        {{ formattedDate }}
      </p>

      <button @click="$emit('share')" class="bounceUpIcon">
        <Icon icon="solar:gallery-send-line-duotone" />
        {{ t('ui.asks.shareImage') }}
      </button>
    </HStack>

    <p class="askContent">{{ ask.content }}</p>
    <p v-if="shareMessage" class="light shareMessage">{{ shareMessage }}</p>
  </VStack>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .askCard
    @include utils.listItemBorder

    border-radius: 0
    padding: 0.75rem 0
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
