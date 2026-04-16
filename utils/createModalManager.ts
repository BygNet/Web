import { auth } from '@/auth/session'
import { showingCreateModal } from '@/data/visibility'

export async function openCreateModal(): Promise<void> {
  const localePath = useLocalePath()

  if (!auth.user) {
    await navigateTo(localePath('/login'))
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
