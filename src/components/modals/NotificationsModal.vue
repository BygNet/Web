<script setup lang="ts">
  import { Icon } from '@iconify/vue'

  import Modal from '@/components/layout/Modal.vue'
  import ModalActions from '@/components/layout/ModalActions.vue'
  import VStack from '@/components/layout/VStack.vue'
  import router from '@/router.ts'

  const emit = defineEmits([ 'close' ])

  function close(): void {
    emit('close')
  }

  function openNotifications(): void {
    router.push('/notifications')
    close()
  }
</script>

<template>
  <Modal>
    <VStack class="notificationsModal">
      <h2>Don't forget to enable notifications!</h2>
      <p>Stay up to date with messages, comments, and more.</p>
      <p>Go to Notifications, and enable push alerts.</p>

      <ModalActions>
        <template #cancellationAction>
          <button class="transparent" @click="close">Close</button>
        </template>
        <template #confirmationAction>
          <button class="prominent" @click="openNotifications">
            <Icon icon="solar:bell-bing-line-duotone" />
            Notifications
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
