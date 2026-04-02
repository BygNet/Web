import type { CSSProperties } from 'vue'

import { isThemeDark } from '@/data/themes.ts'

const profileThemeClass = 'themedProfile'
const profileVarKeys = [
  '--profileBackgroundColor',
  '--profileForegroundColor',
  '--profileForegroundOpaque',
  '--profileTextColor',
  '--profileAccentColor',
  '--profileShadowColor',
] as const

type Rgb = {
  r: number
  g: number
  b: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function normalizeHexColor(color: string | null | undefined): string | null {
  if (!color) return null

  const normalized = color.trim().replace(/^#/, '')

  if (/^[\da-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .split('')
      .map(char => `${char}${char}`)
      .join('')
      .toLowerCase()}`
  }

  if (/^[\da-f]{6}$/i.test(normalized)) {
    return `#${normalized.toLowerCase()}`
  }

  return null
}

function hexToRgb(color: string): Rgb {
  const hex = color.slice(1)

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const red = r / 255
  const green = g / 255
  const blue = b / 255

  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2
  const delta = max - min

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 }
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))

  let hue: number

  switch (max) {
    case red:
      hue = ((green - blue) / delta) % 6
      break
    case green:
      hue = (blue - red) / delta + 2
      break
    default:
      hue = (red - green) / delta + 4
      break
  }

  return {
    h: Math.round(hue * 60 < 0 ? hue * 60 + 360 : hue * 60),
    s: saturation * 100,
    l: lightness * 100,
  }
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const saturation = clamp(s, 0, 100) / 100
  const lightness = clamp(l, 0, 100) / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = (((h % 360) + 360) % 360) / 60
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1))

  let red = 0
  let green = 0
  let blue = 0

  if (huePrime >= 0 && huePrime < 1) {
    red = chroma
    green = x
  } else if (huePrime < 2) {
    red = x
    green = chroma
  } else if (huePrime < 3) {
    green = chroma
    blue = x
  } else if (huePrime < 4) {
    green = x
    blue = chroma
  } else if (huePrime < 5) {
    red = x
    blue = chroma
  } else {
    red = chroma
    blue = x
  }

  const match = lightness - chroma / 2

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  }
}

function toRgbString(rgb: Rgb, alpha?: number): string {
  if (alpha == null) {
    return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`
  }

  return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${alpha})`
}

function buildLightPalette(h: number, s: number, l: number) {
  return {
    '--profileBackgroundColor': toRgbString(
      hslToRgb(h, Math.max(24, s * 0.45), 92)
    ),
    '--profileForegroundColor': toRgbString(
      hslToRgb(h, Math.max(24, s * 0.38), 76),
      0.26
    ),
    '--profileForegroundOpaque': toRgbString(
      hslToRgb(h, Math.max(28, s * 0.48), 70)
    ),
    '--profileTextColor': 'rgba(18, 15, 25, 0.92)',
    '--profileAccentColor': toRgbString(
      hslToRgb(h, clamp(s + 8, 44, 90), clamp(l, 50, 60))
    ),
    '--profileShadowColor': toRgbString(
      hslToRgb(h, Math.max(34, s * 0.55), 26),
      0.78
    ),
  }
}

function buildDarkPalette(h: number, s: number, l: number) {
  return {
    '--profileBackgroundColor': toRgbString(
      hslToRgb(h, Math.max(22, s * 0.42), 12)
    ),
    '--profileForegroundColor': toRgbString(
      hslToRgb(h, Math.max(18, s * 0.34), 42),
      0.26
    ),
    '--profileForegroundOpaque': toRgbString(
      hslToRgb(h, Math.max(22, s * 0.42), 29)
    ),
    '--profileTextColor': 'rgba(245, 242, 248, 0.94)',
    '--profileAccentColor': toRgbString(
      hslToRgb(h, clamp(s + 6, 48, 92), clamp(l + 8, 56, 68))
    ),
    '--profileShadowColor': toRgbString(
      hslToRgb(h, Math.max(26, s * 0.48), 78),
      0.72
    ),
  }
}

export function isDarkThemeActive(): boolean {
  return isThemeDark()
}

export function buildProfileThemeVars(
  color: string | null | undefined,
  isDark = isDarkThemeActive()
): CSSProperties | null {
  const normalized = normalizeHexColor(color)
  if (!normalized) return null

  const { h, s, l } = rgbToHsl(hexToRgb(normalized))

  return isDark ? buildDarkPalette(h, s, l) : buildLightPalette(h, s, l)
}

export function clearDocumentProfileTheme(): void {
  const html = document.documentElement

  html.classList.remove(profileThemeClass)

  for (const key of profileVarKeys) {
    html.style.removeProperty(key)
  }
}

export function applyProfileThemeToDocument(
  color: string | null | undefined
): void {
  const vars = buildProfileThemeVars(color)

  if (!vars) {
    clearDocumentProfileTheme()
    return
  }

  const html = document.documentElement
  html.classList.add(profileThemeClass)

  for (const [ key, value ] of Object.entries(vars)) {
    html.style.setProperty(key, value)
  }
}
