<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  import Modal from '@/components/layout/Modal.vue'
  import ModalActions from '@/components/layout/ModalActions.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { setFlag } from '@/utils/setUserFlag'

  const emit = defineEmits([ 'close' ])
  const { t } = useI18n()

  function close(): void {
    setFlag('showByg2Alpha', false)
    emit('close')
  }
</script>

<template>
  <Modal>
    <VStack class="byg2Modal">
      <h2>{{ t('ui.byg2.title') }}</h2>

      <!-- prettier-ignore -->
      <p>{{ t('ui.byg2.body1') }}</p>
      <p>{{ t('ui.byg2.body2') }}</p>

      <ModalActions>
        <template #cancellationAction>
          <button class="transparent" @click="$emit('close')">
            {{ t('common.close') }}
          </button>
        </template>
        <template #confirmationAction>
          <button class="prominent" @click="close()">
            {{ t('common.ok') }}
          </button>
        </template>
      </ModalActions>
    </VStack>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .byg2Modal
    @include utils.itemBackground
</style>
