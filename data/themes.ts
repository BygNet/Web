import { type Ref, ref } from 'vue'

let html: HTMLElement | null = null
let systemThemeQuery: MediaQueryList | null = null

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  html = document.querySelector('html')
  systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
}

export const currentThemeKey: Ref<string> = ref('')
export const systemPrefersDark: Ref<boolean> = ref(
  systemThemeQuery?.matches ?? false
)

export interface BygTheme {
  title: string
  description: string
  key: string
  colorPreview: string
  isDark: boolean
}

export const BygThemes: BygTheme[] = [
  {
    title: 'Automatic',
    description: 'Byg Light/Dark based on your device.',
    key: 'auto',
    colorPreview: '#fdd1ff',
    isDark: false,
  },
  {
    title: 'Byg Light',
    description: 'Standard Byg light mode.',
    key: 'light',
    colorPreview: '#fdd1ff',
    isDark: false,
  },
  {
    title: 'Byg Dark',
    description: 'Standard Byg dark mode.',
    key: 'dark',
    colorPreview: '#170023',
    isDark: true,
  },
  {
    title: 'Legacy Light',
    description: 'Old Byg light mode theme.',
    key: 'leg-light',
    colorPreview: '#bee7f3',
    isDark: false,
  },
  {
    title: 'Legacy Dark',
    description: 'Old Byg dark mode theme.',
    key: 'leg-dark',
    colorPreview: '#001823',
    isDark: true,
  },
  {
    title: 'a35hie Light',
    description: "a35hie's light mode theme.",
    key: 'a35hie',
    colorPreview: '#ccbef3',
    isDark: false,
  },
  {
    title: 'a35hie Dark',
    description: "a35hie's dark mode theme.",
    key: 'a35hie-dark',
    colorPreview: '#0c0023',
    isDark: true,
  },
  {
    title: 'Neon Dark',
    description: 'Purple + Yellow VScode-inspired neon theme.',
    key: 'neon',
    colorPreview: '#3a16a5',
    isDark: true,
  },
  {
    title: 'Pastel Blue',
    description: 'Byg Classic pastel blue theme.',
    key: 'pastel-blue',
    colorPreview: '#a7f2ff',
    isDark: false,
  },
]

function clearThemeClasses(): void {
  if (!html) return

  for (const theme of BygThemes) {
    html.classList.remove(theme.key)
  }
}

function getResolvedThemeKey(key: string): string {
  if (key !== 'auto') {
    return key
  }

  return systemPrefersDark.value ? 'dark' : 'light'
}

if (systemThemeQuery) {
  systemThemeQuery.addEventListener('change', event => {
    systemPrefersDark.value = event.matches

    if (currentThemeKey.value === 'auto') {
      clearThemeClasses()

      if (html) {
        html.classList.add(event.matches ? 'dark' : 'light')
        html.classList.add('auto')
      }

      document.documentElement.style.colorScheme = event.matches
        ? 'dark'
        : 'light'
    }
  })
}

export function getThemeByKey(key: string): BygTheme | undefined {
  return BygThemes.find(theme => theme.key === key)
}

export function isThemeDark(key: string = currentThemeKey.value): boolean {
  if (key === 'auto') {
    return systemPrefersDark.value
  }

  return getThemeByKey(key)?.isDark ?? false
}

export function loadTheme(): void {
  const cookie = useCookie<string>('bygTheme')

  const savedTheme = cookie.value ?? 'auto'

  clearThemeClasses()

  if (html) {
    html.classList.add(getResolvedThemeKey(savedTheme))
    html.classList.add(savedTheme)
  }

  if (typeof document !== 'undefined') {
    document.documentElement.style.colorScheme = isThemeDark(savedTheme)
      ? 'dark'
      : 'light'
  }

  currentThemeKey.value = savedTheme
}

export function setTheme(theme: BygTheme): void {
  if (typeof document === 'undefined') return

  clearThemeClasses()

  const cookie = useCookie<string>('bygTheme', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  cookie.value = theme.key

  // apply instantly
  if (html) {
    html.classList.add(getResolvedThemeKey(theme.key))
    html.classList.add(theme.key)
  }

  document.documentElement.style.colorScheme = isThemeDark(theme.key)
    ? 'dark'
    : 'light'

  currentThemeKey.value = theme.key
}
