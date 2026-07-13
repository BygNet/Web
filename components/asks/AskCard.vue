<script setup lang="ts">
  import type { BygAsk } from '@bygnet/types'
  import { getAskGradient, getAskVariantById } from '@bygnet/types'
  import { Icon } from '@iconify/vue'
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  import HStack from '@/components/layout/HStack.vue'
  import VStack from '@/components/layout/VStack.vue'

  const props = defineProps<{
    ask: BygAsk
    username: string
  }>()

  const { t } = useI18n()
  const shareMessage = ref<string | null>(null)
  const formattedDate = computed(() =>
    new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(props.ask.createdDate))
  )
  const askVariant = getAskVariantById(props.ask.variantId)
  const askKey = computed(() => {
    return `ask-variants.${askVariant.id}.`
  })
</script>

<template>
  <VStack class="askCard">
    <HStack class="type">
      <Icon :icon="askVariant.icon" />
      <p class="title" :style="{ '--tint': getAskGradient(askVariant) }">
        {{ t(askKey + 'title') }}
      </p>
    </HStack>

    <HStack class="autoSpace askMeta">
      <p class="light">
        {{ formattedDate }}
      </p>
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
    gap: 0.25rem
    cursor: pointer

    .type p
      --tint: white, white

      background: linear-gradient(to var(--trailing), var(--tint))
      -webkit-background-clip: text
      background-clip: text
      color: transparent

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
