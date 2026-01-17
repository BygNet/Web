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
  return value.toLocaleString(document.querySelector('html')?.lang)
}
