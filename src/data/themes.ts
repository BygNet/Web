import {ref, type Ref} from "vue";

const html: HTMLElement = document.querySelector('html')!
export const currentThemeKey: Ref<string> = ref('')

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
    colorPreview: '#bee7f3',
    isDark: false,
  },
  {
    title: 'Byg Light',
    description: 'Standard Byg light mode.',
    key: 'light',
    colorPreview: '#bee7f3',
    isDark: false,
  },
  {
    title: 'Byg Dark',
    description: 'Standard Byg dark mode.',
    key: 'dark',
    colorPreview: '#001823',
    isDark: true,
  },
  {
    title: 'a35hie Light',
    description: 'a35hie\'s light mode theme.',
    key: 'a35hie',
    colorPreview: '#ccbef3',
    isDark: false,
  },
  {
    title: 'a35hie Dark',
    description: 'a35hie\'s dark mode theme.',
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
    title: 'Pastel Pink',
    description: 'Light, soft pink theme.',
    key: 'pastel-pink',
    colorPreview: '#f3a7ff',
    isDark: false,
  }
]

export function loadTheme(): void {
  const savedTheme: string | null = localStorage.getItem('bygTheme')
  let toSet: string

  if (savedTheme != null) {
    toSet = savedTheme
  } else {
    toSet = 'auto'
  }

  html.classList.add(toSet)
  currentThemeKey.value = toSet
}

export function setTheme(theme: BygTheme): void {
  const savedTheme: string | null = localStorage.getItem('bygTheme')

  if (savedTheme != null) {
    html.classList.remove(savedTheme)
  }

  localStorage.setItem('bygTheme', theme.key)
  html.classList.add(theme.key)
  currentThemeKey.value = theme.key
}
