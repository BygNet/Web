export function formatStat(value: number): string {
  if (value < 1_000) return String(value)

  if (value < 1_000_000) {
    const v: number = value / 1_000
    return `${Math.floor(v * 10) / 10}k`
  }

  if (value < 1_000_000_000) {
    const v: number = value / 1_000_000
    return `${Math.floor(v * 10) / 10}M`
  }

  const v: number = value / 1_000_000_000
  return `${Math.floor(v * 10) / 10}B`
}

export function formatNumber(value: number): string {
  const locale =
    typeof document !== 'undefined'
      ? document.querySelector('html')?.lang
      : undefined

  return value.toLocaleString(locale)
}

export function formatDate(input: string): string {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
