import { type Ref, ref } from 'vue'

import type {
  BygShareableContent,
  BygShareModalRequest,
} from '@/types/messages'

export const activeShareRequest: Ref<BygShareModalRequest | null> = ref(null)
export const showingShareModal: Ref<boolean> = ref(false)

export function openShareModal(
  item: BygShareableContent,
  options: {
    onShared?: () => void
  } = {}
): void {
  activeShareRequest.value = {
    item,
    onShared: options.onShared,
  }
  showingShareModal.value = true
}

export function notifyShareCompleted(): void {
  activeShareRequest.value?.onShared?.()
}

export function closeShareModal(): void {
  showingShareModal.value = false
  activeShareRequest.value = null
}
