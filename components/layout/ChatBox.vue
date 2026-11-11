<script setup lang="ts">
import HStack from '~/components/layout/HStack.vue'
import VStack from '~/components/layout/VStack.vue'

const { t } = useI18n()

const showingChatBox: Ref<boolean> = ref(false)
</script>

<template>
  <button
    class="large prominent chatBoxOpen cbEnabled"
    v-if="!showingChatBox"
    @click="showingChatBox = !showingChatBox"
  >
    <Icon name="solar:plane-line-duotone" />
  </button>

  <VStack class="chatBox cbEnabled" v-show="showingChatBox">
    <HStack class="chatBoxHeader fullWidth autoSpace">
      <h2>{{ t('pages.messages.title') }}</h2>

      <button class="closeButton spinIcon" @click="showingChatBox = false">
        <Icon name="mingcute:close-fill" />
      </button>
    </HStack>

    <iframe class="chatBoxContent" src="/messages?embedded=true" />
  </VStack>
</template>

<style scoped lang="sass">
@use "@/styles/variables"
@use "@/styles/utils"

@media (max-width: variables.$mobileWidth)
  .cbEnabled
    display: none !important

.chatBoxOpen, .chatBox
  position: fixed
  z-index: 80
  bottom: 1rem
  right: 1rem

.chatBox
  @include utils.glowEffect

  background: var(--foregroundColor)
  backdrop-filter: blur(0.5rem)
  width: 30rem
  height: 40rem
  border-radius: 1.5rem

  .chatBoxHeader
    padding: 0.75rem 0.75rem 0

    h2
      margin: 0

  .chatBoxContent
    flex-grow: 1
    border: 0
    width: 100%
    border-radius: 0.75rem
</style>
