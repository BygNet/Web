export function useRelativeTime() {
  const { locale } = useI18n()

  const rtf = computed(
    () =>
      new Intl.RelativeTimeFormat(locale.value, {
        numeric: 'auto',
        style: 'short', // gives "11h", "7d", etc
      })
  )

  function format(date: Date | number) {
    const now = Date.now()
    const diff = (new Date(date).getTime() - now) / 1000 // seconds

    const units = [
      { unit: 'year', secs: 60 * 60 * 24 * 365 },
      { unit: 'month', secs: 60 * 60 * 24 * 30 },
      { unit: 'week', secs: 60 * 60 * 24 * 7 },
      { unit: 'day', secs: 60 * 60 * 24 },
      { unit: 'hour', secs: 60 * 60 },
      { unit: 'minute', secs: 60 },
      { unit: 'second', secs: 1 },
    ]

    for (const { unit, secs } of units) {
      const value = diff / secs
      if (Math.abs(value) >= 1) {
        return rtf.value.format(
          Math.round(value),
          unit as Intl.RelativeTimeFormatUnit
        )
      }
    }

    return 'now'
  }

  return { format }
}
