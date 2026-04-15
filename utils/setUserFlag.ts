const keyPrefix: string = 'byg-'

function storage(): Pick<Storage, 'getItem' | 'setItem'> {
  if (typeof window !== 'undefined') {
    return localStorage
  } else {
    // Shims for server - return null like real localStorage for non-existent keys
    return {
      getItem: (key: string): string | null => {
        return null
      },
      setItem: (key: string, value: string): void => {},
    }
  }
}

function getPreKey(key: string): string {
  return keyPrefix + key
}

export function getFlag(key: string, defaultVal?: boolean): boolean {
  key = getPreKey(key)
  const store = storage()

  if (store.getItem(key) === null) {
    if (defaultVal) {
      return defaultVal
    } else {
      return false
    }
  } else {
    return store.getItem(key) === 'true'
  }
}

export function setFlag(key: string, value: boolean): void {
  key = getPreKey(key)
  storage().setItem(key, value.toString())
}
