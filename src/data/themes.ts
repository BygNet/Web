import { type Ref, ref } from 'vue'

import { getStorage } from '@/utils/storage'

const html: HTMLElement | null =
  typeof document !== 'undefined' ? document.querySelector('html') : null
const systemThemeQuery =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null
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
    isDark: false,
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
    title: 'Geist Dark',
    description: 'The famous Vercel style - on Byg.',
    key: 'geist',
    colorPreview: 'black',
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

const themeClassKeys = BygThemes.map(theme => theme.key)

function getHtmlElement(): HTMLElement | null {
  return typeof document !== 'undefined' ? document.documentElement : html
}

export function clearThemeClasses(): void {
  const nextHtml = getHtmlElement()
  if (!nextHtml) return

  for (const themeKey of themeClassKeys) {
    nextHtml.classList.remove(themeKey)
  }
}

export function applyThemeClass(themeKey: string): void {
  const nextHtml = getHtmlElement()
  if (!nextHtml) return

  clearThemeClasses()
  nextHtml.classList.add(themeKey)
}

systemThemeQuery?.addEventListener('change', event => {
  systemPrefersDark.value = event.matches
})

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
  const storage = getStorage()
  const savedTheme: string | null = storage?.getItem('bygTheme') ?? null
  const toSet = savedTheme ?? 'auto'

  applyThemeClass(toSet)
  currentThemeKey.value = toSet
}

export function setTheme(theme: BygTheme): void {
  const storage = getStorage()
  storage?.setItem('bygTheme', theme.key)
  applyThemeClass(theme.key)
  currentThemeKey.value = theme.key
}
