<script setup lang="ts">
  import Modal from '@/components/layout/Modal.vue'
  import ModalActions from '@/components/layout/ModalActions.vue'
  import VStack from '@/components/layout/VStack.vue'
  import { setFlag } from '@/utils/setUserFlag.ts'

  const emit = defineEmits([ 'close' ])

  function close(): void {
    setFlag('showByg2Alpha', false)
    emit('close')
  }
</script>

<template>
  <Modal>
    <VStack class="byg2Modal">
      <h2>Welcome to Byg 2.0!</h2>
      <p>
        Byg 2.0 is still a work in progress, but you'll probably see some
        changes to the UI!
      </p>
      <p>Feedback? Contact us via Byg Chat.</p>

      <ModalActions>
        <template #cancellationAction>
          <button class="transparent" @click="$emit('close')">Close</button>
        </template>
        <template #confirmationAction>
          <button class="prominent" @click="close()">OK</button>
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
