import { auth } from '@/auth/session.ts'
import { showingCreateModal } from '@/data/visibility.ts'
import router from '@/router.ts'

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
