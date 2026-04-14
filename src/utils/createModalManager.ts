import { auth } from '@/auth/session.ts'
import { showingCreateModal } from '@/data/visibility.ts'

export async function openCreateModal(): Promise<void> {
  if (!auth.user) {
    await navigateTo('/login')
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
