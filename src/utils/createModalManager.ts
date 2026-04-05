import { auth } from '@/auth/session'
import { showingCreateModal } from '@/data/visibility'
import router from '@/router'

export function openCreateModal(): void {
  if (!auth.user) {
    router.push({ name: 'login' })
  } else {
    showingCreateModal.value = true
  }
}

export function closeCreateModal(): void {
  showingCreateModal.value = false
}

export function toggleCreateModal(): void {
  showingCreateModal.value = !showingCreateModal.value
}
