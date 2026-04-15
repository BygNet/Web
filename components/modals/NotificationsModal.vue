<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import Modal from '@/components/layout/Modal.vue'
  import ModalActions from '@/components/layout/ModalActions.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { useI18n } from 'vue-i18n'
  
  const emit = defineEmits([ 'close' ])
  const { t } = useI18n()

  function close(): void {
    emit('close')
  }

  function openNotifications(): void {
    navigateTo('/notifications')
    close()
  }
</script>

<template>
  <Modal>
    <VStack class="notificationsModal">
      <h2>{{ t('ui.notificationsModal.title') }}</h2>
      <p>{{ t('ui.notificationsModal.line1') }}</p>
      <p>{{ t('ui.notificationsModal.line2') }}</p>

      <ModalActions>
        <template #cancellationAction>
          <button class="transparent" @click="close">
            {{ t('common.close') }}
          </button>
        </template>
        <template #confirmationAction>
          <button class="prominent" @click="openNotifications">
            <Icon icon="solar:bell-bing-line-duotone" />
            {{ t('ui.notificationsModal.action') }}
          </button>
        </template>
      </ModalActions>
    </VStack>
  </Modal>
</template>

<style scoped lang="sass">
  @use "@/styles/utils"

  .notificationsModal
    @include utils.itemBackground
</style>
