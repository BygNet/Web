function normalize(path: string) {
  // remove locale like /en, /zh, etc.
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
}

export function isActive(current: string, target: string) {
  const c = normalize(current)
  const t = normalize(target)

  if (t === '/') return c === '/'

  return c === t || c.startsWith(t + '/')
}
