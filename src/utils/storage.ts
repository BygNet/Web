export interface SafeStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  key(index: number): string | null
  readonly length: number
}

export function getStorage(): SafeStorage | null {
  const candidate = globalThis.localStorage as Partial<SafeStorage> | undefined

  if (
    !candidate ||
    typeof candidate.getItem !== 'function' ||
    typeof candidate.setItem !== 'function' ||
    typeof candidate.removeItem !== 'function' ||
    typeof candidate.key !== 'function' ||
    typeof candidate.length !== 'number'
  ) {
    return null
  }

  return candidate as SafeStorage
}
